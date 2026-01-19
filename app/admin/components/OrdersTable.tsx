'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditOrderModal from '../in-transit/components/EditOrderModal';
import DeleteOrderModal from '../in-transit/components/DeleteOrderModal';

type Order = {
  id: string;
  type: string;
  status: string;
  totalAmount: number;
  currency: string;
  weight: string;
  smsSent: boolean;
  notes: string | null;
  createdAt: string;
  userId?: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

type OrdersTableProps = {
  orders: Order[];
  currentStatus: string;
  onOrderRemoved?: (orderId: string) => void;
  onOrderUpdated?: (order: Order) => void;
};

const statusOptions = [
  { value: 'in_transit', label: 'გზაში' },
  { value: 'warehouse', label: 'საწყობში' },
  { value: 'stopped', label: 'გაჩერებული' },
  { value: 'delivered', label: 'გაცემული' },
  { value: 'pending', label: 'მოლოდინში' },
  { value: 'cancelled', label: 'გაუქმებული' },
];

export default function OrdersTable({ orders: initialOrders, currentStatus, onOrderRemoved, onOrderUpdated }: OrdersTableProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
console.log(orders);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setError('');

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'სტატუსის განახლებისას მოხდა შეცდომა');
        return;
      }

      // Remove order from list if status changed away from current status
      if (newStatus !== currentStatus) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (onOrderRemoved) {
          onOrderRemoved(orderId);
        }
      } else {
        // Update order status in list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    // If status changed away from current status, remove from list
    if (updatedOrder.status !== currentStatus) {
      setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
      if (onOrderRemoved) {
        onOrderRemoved(updatedOrder.id);
      }
    } else {
      // Update order in list
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    }
    if (onOrderUpdated) {
      onOrderUpdated(updatedOrder);
    }
  };

  const handleOrderDeleted = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (onOrderRemoved) {
      onOrderRemoved(orderId);
    }
  };

  return (
    <>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-[16px] text-red-800">{error}</p>
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">მომხმარებელი</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">ტიპი</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">წონა</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">სტატუსი</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">თანხა</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">თარიღი</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">მოქმედებები</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[16px] text-gray-600">
                  ჯერ არცერთი Order არ არის.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-[16px] text-black">
                    {order.user.email}
                    {(order.user.firstName || order.user.lastName) && (
                      <span className="block text-sm text-gray-500">
                        {order.user.firstName} {order.user.lastName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-[16px] text-black">{order.type}</td>
                  <td className="px-4 py-2 text-[16px] text-black">{order.weight || '—'}</td>
                  <td className="px-4 py-2 text-[16px]">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-[16px] text-black">
                    {order.totalAmount.toFixed(2)} {order.currency || 'USD'}
                  </td>
                  <td className="px-4 py-2 text-[16px] text-black">{order.createdAt}</td>
                  <td className="px-4 py-2 text-[16px]">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingOrder({ ...order, userId: order.userId || order.user.id })}
                        className="rounded-md bg-blue-600 px-3 py-1 text-[14px] font-medium text-white hover:bg-blue-700"
                      >
                        ცვლილება
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingOrder(order)}
                        className="rounded-md bg-red-600 px-3 py-1 text-[14px] font-medium text-white hover:bg-red-700"
                      >
                        წაშლა
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditOrderModal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
        onOrderUpdated={handleOrderUpdated}
      />

      <DeleteOrderModal
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        order={deletingOrder}
        onOrderDeleted={handleOrderDeleted}
      />
    </>
  );
}
