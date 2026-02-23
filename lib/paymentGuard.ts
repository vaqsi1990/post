import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import prisma from './prisma';

/**
 * Use before creating or processing a payment.
 * Returns { allowed: false, error } if user is not phone-verified.
 * Returns { allowed: true, userId } if user can pay.
 */
export async function requirePhoneVerifiedForPayment(): Promise<
  | { allowed: true; userId: string }
  | { allowed: false; error: string; status: number }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { allowed: false, error: 'ავტორიზაცია საჭიროა', status: 401 };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phoneVerified: true },
  });
  if (!user?.phoneVerified) {
    return {
      allowed: false,
      error: 'გადახდისთვის საჭიროა ტელეფონის ვერიფიკაცია (რეგისტრაციისას მიღებული SMS კოდი)',
      status: 403,
    };
  }
  return { allowed: true, userId: session.user.id };
}
