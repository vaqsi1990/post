import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import BalanceTopUp from './components/BalanceTopUp';

export const dynamic = 'force-dynamic';

export default async function DashboardBalancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });

  const balance = user?.balance ?? 0;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-2xl px-4">
        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="pb-6 border-b border-gray-200">
            <Link href="/dashboard" className="text-[15px] font-medium text-gray-600 hover:text-black">
              ← უკან დაბრუნება
            </Link>
          </div>
          <div className="pt-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-6">ბალანსის შევსება</h1>
            <BalanceTopUp initialBalance={balance} />
          </div>
        </main>
      </div>
    </div>
  );
}
