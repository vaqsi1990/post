'use client';

import { useState } from 'react';

export type UserParcel = {
  id: string;
  trackingNumber: string;
  status: string;
  price: number;
  currency: string;
  weight: string;
  originCountry: string | null;
  quantity: number;
  customerName: string;
  createdAt: string;
};

type Props = {
  parcels: UserParcel[];
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pending', label: 'მოლოდინში' },
  { value: 'in_transit', label: 'გზაში' },
  { value: 'arrived', label: 'ჩამოსული' },

  { value: 'delivered', label: 'გატანილი' },
  { value: 'cancelled', label: 'გაუქმებული' },
];

export default function UserParcelsTabs({ parcels }: Props) {
  const [activeStatus, setActiveStatus] = useState<string>('pending');

  const filtered = parcels.filter((p) => p.status === activeStatus);

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-[18px] md:text-[20px] font-semibold text-black">
        ამანათები 
      </h2>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 text-[14px] md:text-[15px]">
        {STATUS_OPTIONS.map((status) => {
          const isActive = activeStatus === status.value;
          const count = parcels.filter((p) => p.status === status.value).length;

          return (
            <button
              key={status.value}
              type="button"
              onClick={() => setActiveStatus(status.value)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
                isActive
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span>{status.label}</span>
              <span
                className={`min-w-[1.75rem] rounded-full px-2 py-0.5 text-center text-[12px] ${
                  isActive ? 'bg-[#3a5bff]' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                თრექინგი
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                კლიენტი
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                რაოდენობა
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                წონა
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                თანხა
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                თარიღი
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-[15px] text-gray-500"
                >
                  არჩეულ სტატუსში ამანათი არ არის.
                </td>
              </tr>
            ) : (
              filtered.map((parcel) => (
                <tr key={parcel.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-[15px] text-black">
                    {parcel.trackingNumber}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {parcel.customerName}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {parcel.quantity}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {parcel.weight || '—'}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {parcel.price.toFixed(2)} {parcel.currency}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {parcel.createdAt}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center text-[15px] text-gray-500">
            არჩეულ სტატუსში ამანათი არ არის.
          </div>
        ) : (
          filtered.map((parcel) => (
            <div
              key={parcel.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold text-black">
                    {parcel.customerName}
                  </p>
                  <p className="text-[13px] text-gray-600">
                    {parcel.trackingNumber}
                  </p>
                </div>
                <div className="text-right text-[13px] text-gray-500">
                  <p>{parcel.createdAt}</p>
                  <p>{parcel.originCountry || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[13px] text-gray-700">
                <span className="text-gray-500">რაოდენობა</span>
                <span className="text-black">{parcel.quantity}</span>

                <span className="text-gray-500">წონა</span>
                <span className="text-black">{parcel.weight || '—'}</span>

                <span className="text-gray-500">თანხა</span>
                <span className="text-black">
                  {parcel.price.toFixed(2)} {parcel.currency}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

