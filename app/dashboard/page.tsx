import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';
import prisma from '../../lib/prisma';
import UserOrdersTabs from './components/UserOrdersTabs';
import DashboardHeader from './components/DashboardHeader';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');

  const userId = session.user.id;
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

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
          <UserOrdersTabs orders={formattedOrders} />
        </main>
      </div>
    </div>
  );
}
