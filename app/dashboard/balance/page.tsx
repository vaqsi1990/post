import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import DashboardHeader from '../components/DashboardHeader';
import BalanceTopUp from './components/BalanceTopUp';

export const dynamic = 'force-dynamic';

export default async function DashboardBalancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');

  const userId = session.user.id;

  const result = await prisma.payment.aggregate({
    where: {
      userId,
      parcelId: null,
      orderId: null,
      status: 'completed',
    },
    _sum: { amount: true },
  });

  const balance = result._sum.amount ?? 0;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-2xl px-4">
        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <DashboardHeader />
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-900">ბალანსის შევსება</h1>
              <Link
                href="/dashboard"
                className="text-[15px] font-medium text-gray-600 hover:text-black"
              >
                ← უკან დაბრუნება
              </Link>
            </div>
            <BalanceTopUp initialBalance={balance} />
          </div>
        </main>
      </div>
    </div>
  );
}
