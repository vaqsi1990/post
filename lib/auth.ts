import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { loginSchema } from './validations';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('ელ-ფოსტა და პაროლი აუცილებელია');
        }

        // Validate input
        const validatedData = loginSchema.parse({
          email: credentials.email,
          password: credentials.password,
        });

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: validatedData.email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneVerified: true,
            password: true,
            roomNumber: true,
          },
        });

        if (!user) {
          throw new Error('ელ-ფოსტა ან პაროლი არასწორია');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          validatedData.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('ელ-ფოსტა ან პაროლი არასწორია');
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          role: user.role,
          phoneVerified: user.phoneVerified ?? false,
          roomNumber: user.roomNumber,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as {
          id?: string;
          role?: string;
          phoneVerified?: boolean;
          roomNumber?: string | null;
        };
        token.id = user.id;
        token.role = u.role ?? 'USER';
        token.phoneVerified = u.phoneVerified ?? false;
        token.roomNumber = u.roomNumber ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phoneVerified = token.phoneVerified as boolean;
        session.user.roomNumber = token.roomNumber as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
