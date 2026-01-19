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
          throw new Error('ელფოსტა და პაროლი აუცილებელია');
        }

        // Validate input
        const validatedData = loginSchema.parse({
          email: credentials.email,
          password: credentials.password,
        });

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: validatedData.email },
        });

        if (!user) {
          throw new Error('ელფოსტა ან პაროლი არასწორია');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          validatedData.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('ელფოსტა ან პაროლი არასწორია');
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
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
