import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import UserOrdersTabs from '@/app/dashboard/components/UserOrdersTabs';
import DashboardHeader from '@/app/dashboard/components/DashboardHeader';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const tBalance = await getTranslations('balance');

  if (!session?.user) redirect(`/${locale}/login`);
  if (session.user.role === 'ADMIN') redirect(`/${locale}/admin`);

  const userId = session.user.id;

  const [orders, balanceResult] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.aggregate({
      where: {
        userId,
        parcelId: null,
        orderId: null,
        status: 'completed',
      },
      _sum: { amount: true },
    }),
  ]);

  const balance = balanceResult._sum.amount ?? 0;

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    type: order.type,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency || 'GEL',
    weight: order.weight || '',
    notes: order.notes,
    createdAt: new Date(order.createdAt).toLocaleDateString('ka-GE'),
  }));

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-7xl px-4">
        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <DashboardHeader />
          <Link
            href="/dashboard/balance"
            className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 sm:px-5 sm:py-4"
          >
            <span className="text-[15px] font-medium text-gray-700 sm:text-[16px]">
              {tBalance('currentBalance')}
            </span>
            <span className="text-xl font-semibold text-gray-900 sm:text-2xl">
              {balance.toFixed(2)} <span className="text-base font-medium text-gray-600 sm:text-lg">GEL</span>
            </span>
          </Link>
          <UserOrdersTabs orders={formattedOrders} />
        </main>
      </div>
    </div>
  );
}
