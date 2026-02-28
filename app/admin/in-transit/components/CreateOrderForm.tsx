'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

type CreateOrderFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (order: any) => void;
};

export default function CreateOrderForm({ isOpen, onClose, onOrderCreated }: CreateOrderFormProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState({
    userId: '',
    totalAmount: '',
    weight: '',
    notes: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('ვერ მოხერხდა მომხმარებლების წამოღება');
        const data = await res.json();
        setUsers(data.users || []);
      } catch {
        setError('დაფიქსირდა შეცდომა მომხმარებლების წამოღებისას');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount: parseFloat(formData.totalAmount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Order-ის შექმნისას მოხდა შეცდომა');
        return;
      }

      setSuccess('Order წარმატებით შეიქმნა');
      
      console.log('[CreateOrderForm] Order created successfully:', {
        orderId: data.order?.id,
        status: data.order?.status,
        hasCallback: !!onOrderCreated,
        fullOrder: data.order
      });
      
      // Notify parent component about new order - API already returns formatted data
      // The parent will handle fetching to confirm the order
      if (onOrderCreated && data.order) {
        // Always call onOrderCreated if we have an order, regardless of status
        // The parent component will handle filtering based on status
        console.log('[CreateOrderForm] Calling onOrderCreated with order:', data.order);
        try {
          onOrderCreated(data.order);
          console.log('[CreateOrderForm] onOrderCreated called successfully');
        } catch (error) {
          console.error('[CreateOrderForm] Error calling onOrderCreated:', error);
        }
      } else {
        console.warn('[CreateOrderForm] onOrderCreated not called:', { 
          hasCallback: !!onOrderCreated, 
          hasOrder: !!data.order,
          orderData: data.order
        });
        // If callback doesn't exist, refresh to update pages
        router.refresh();
      }
      
      setFormData({
        userId: '',
        totalAmount: '',
        weight: '',
        notes: '',
      });
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
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

        <h2 className="mb-4 text-xl font-semibold text-black">ახალი ამანათის დამატება</h2>

        {loading ? (
          <p className="text-[16px] text-black">იტვირთება...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-[16px] text-green-800">{success}</p>
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-[16px] text-red-800">{error}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[16px] font-medium text-black mb-1" htmlFor="userId">
            მომხმარებელი *
          </label>
          <select
            id="userId"
            required
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">აირჩიეთ მომხმარებელი</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} {user.firstName || user.lastName ? `(${user.firstName || ''} ${user.lastName || ''})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[16px] font-medium text-black mb-1" htmlFor="totalAmount">
            თანხა *
          </label>
          <input
            id="totalAmount"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-[16px] font-medium text-black mb-1" htmlFor="weight">
            წონა (kg)
          </label>
          <input
            id="weight"
            type="text"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="0.0"
          />
        </div>
      </div>

      <div>
        <label className="block text-[16px] font-medium text-black mb-1" htmlFor="notes">
          შენიშვნები
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-[16px] font-semibold text-black hover:bg-gray-50"
              >
                გაუქმება
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-black px-4 py-2 text-[16px] font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'ინახება...' : 'დამატება'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
