import AdminShell from '../components/AdminShell';
import prisma from '../../../lib/prisma';
import OrdersManager from '../components/OrdersManager';

export default async function AdminDeliveredPage() {
  const orders = await prisma.order.findMany({
    where: {
      status: 'delivered',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Format dates on server side
  const formattedOrders = orders.map((order) => ({
    ...order,
    createdAt: new Date(order.createdAt).toLocaleDateString('ka-GE'),
    currency: order.currency || 'USD',
  }));

  return (
    <AdminShell
      title="გაცემული"
      description="გაცემული Order-ების მართვა."
    >
      <div className="space-y-6">
        <OrdersManager initialOrders={formattedOrders} currentStatus="delivered" />
      </div>
    </AdminShell>
  );
}

