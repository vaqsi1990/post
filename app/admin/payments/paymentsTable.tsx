'use client';

import { useEffect, useState } from 'react';

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

type PaymentsResponse = {
  payments: PaymentRow[];
};

export default function PaymentsTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/payments', { method: 'GET' });
        const data = (await res.json()) as Partial<PaymentsResponse> & { error?: string };
        if (!res.ok) throw new Error(data.error || 'ვერ მოხერხდა გადახდების წამოღება');
        if (!mounted) return;
        setPayments(Array.isArray(data.payments) ? data.payments : []);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'დაფიქსირდა შეცდომა');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p className="text-[16px] text-black">იტვირთება...</p>;
  if (error) return <p className="text-[16px] text-red-600">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">თარიღი</th>
            <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">მომხმარებელი</th>
            <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">თანხა</th>
            <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">სტატუსი</th>
            <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">მეთოდი</th>
            <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">ტრანზაქცია</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-[16px] text-black" colSpan={6}>
                გადახდები ვერ მოიძებნა
              </td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-3 py-2 text-[16px] text-black">{p.createdAt}</td>
                <td className="px-3 py-2 text-[16px] text-black">
                  {p.user.firstName || p.user.lastName
                    ? `${p.user.firstName ?? ''} ${p.user.lastName ?? ''}`.trim()
                    : p.user.email}
                </td>
                <td className="px-3 py-2 text-[16px] text-black">
                  {p.amount} {p.currency}
                </td>
                <td className="px-3 py-2 text-[16px] text-black">{p.status}</td>
                <td className="px-3 py-2 text-[16px] text-black">{p.paymentMethod}</td>
                <td className="px-3 py-2 text-[16px] text-black">{p.transactionId || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

