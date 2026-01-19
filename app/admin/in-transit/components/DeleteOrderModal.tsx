'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Order = {
  id: string;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

type DeleteOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderDeleted?: (orderId: string) => void;
};

export default function DeleteOrderModal({ isOpen, onClose, order, onOrderDeleted }: DeleteOrderModalProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDelete = async () => {
    if (!order) return;

    setError('');
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Order-ის წაშლისას მოხდა შეცდომა');
        return;
      }

      // Refresh server components to get latest data
      router.refresh();

      // Notify parent component about deleted order
      if (onOrderDeleted) {
        onOrderDeleted(order.id);
      }

      onClose();
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-black"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-4 text-xl font-semibold text-black">Order-ის წაშლა</h2>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-[16px] text-red-800">{error}</p>
          </div>
        ) : null}

        <p className="mb-6 text-[16px] text-black">
          დარწმუნებული ხართ, რომ გსურთ ამ Order-ის წაშლა?
          <br />
          <span className="mt-2 block font-medium">
            მომხმარებელი: {order.user.email}
            {(order.user.firstName || order.user.lastName) && (
              <span className="block text-sm font-normal text-gray-600">
                {order.user.firstName} {order.user.lastName}
              </span>
            )}
          </span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-[16px] font-semibold text-black hover:bg-gray-50 disabled:opacity-50"
          >
            გაუქმება
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 px-4 py-2 text-[16px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'წაშლა...' : 'წაშლა'}
          </button>
        </div>
      </div>
    </div>
  );
}
