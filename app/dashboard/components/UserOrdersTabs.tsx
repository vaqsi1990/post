'use client';

import { useState, useCallback } from 'react';
import { OrderStatusTabNav, OrderStatusSelect, normalizeOrderStatus } from './order-status-tabs';

export type UserOrder = {
  id: string;
  type: string;
  status: string;
  totalAmount: number;
  currency: string;
  weight: string;
  notes: string | null;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  forwarding: 'ფორვარდინგი',
  customs: 'საბაჟო',
  courier: 'საკურიერო',
  corporate: 'კორპორატიული',
};

type Props = {
  orders: UserOrder[];
};

export default function UserOrdersTabs({ orders }: Props) {
  const [activeTab, setActiveTab] = useState<string>('pending');

  const getCount = useCallback(
    (key: string) => {
      if (key === 'other') return orders.filter((o) => normalizeOrderStatus(o.status) === 'other').length;
      return orders.filter((o) => o.status === key).length;
    },
    [orders]
  );

  const filtered =
    activeTab === 'other'
      ? orders.filter((o) => normalizeOrderStatus(o.status) === 'other')
      : orders.filter((o) => o.status === activeTab);

  return (
    <div className="space-y-0">
      {/* Mobile: status dropdown */}
      <div className="md:hidden">
        <OrderStatusSelect
          value={activeTab}
          onChange={setActiveTab}
          getCount={getCount}
        />
      </div>

      {/* Desktop: tab row */}
      <div className="hidden md:block border-b border-gray-200">
        <OrderStatusTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getCount={getCount}
        />
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto rounded-b-xl border border-gray-200 border-t-0 bg-gray-50/80">
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '28rem' }}>
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700">ტიპი</th>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700">წონა</th>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700">თანხა</th>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700">თარიღი</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[15px] text-gray-500">
                  ამ სტატუსში ჯერ არცერთი შეკვეთა არ არის.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-[15px] text-black">
                    {TYPE_LABELS[order.type] || order.type}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">{order.weight || '—'}</td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {order.totalAmount.toFixed(2)} {order.currency}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">{order.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden rounded-b-xl border border-gray-200 border-t-0 bg-gray-50/80 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-[15px] text-gray-500 bg-white">
            ამ სტატუსში ჯერ არცერთი შეკვეთა არ არის.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white">
            {filtered.map((order) => (
              <li key={order.id} className="p-4">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[14px]">
                  <span className="text-gray-500">ტიპი</span>
                  <span className="text-black font-medium">{TYPE_LABELS[order.type] || order.type}</span>
                  <span className="text-gray-500">წონა</span>
                  <span className="text-black">{order.weight || '—'}</span>
                  <span className="text-gray-500">თანხა</span>
                  <span className="text-black font-medium">{order.totalAmount.toFixed(2)} {order.currency}</span>
                  <span className="text-gray-500">თარიღი</span>
                  <span className="text-black">{order.createdAt}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
