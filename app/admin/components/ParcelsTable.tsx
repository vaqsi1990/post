'use client';

import React, { useState } from 'react';

type Parcel = {
  id: string;
  trackingNumber: string;
  status: string;
  price: number;
  currency: string;
  weight: number | null;
  originCountry: string | null;
  quantity: number;
  customerName: string;
  createdAt: string;
  filePath: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
  };
};

type ParcelsTableProps = {
  parcels: Parcel[];
  currentStatus: string;
  onParcelUpdated?: (parcel: Parcel) => void;
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'მოლოდინში' },
  { value: 'in_transit', label: 'გზაში' },
  { value: 'arrived', label: 'ჩამოსული' },
  { value: 'region', label: 'რეგიონი' },
  { value: 'delivered', label: 'გატანილი' },
  { value: 'cancelled', label: 'გაუქმებული' },
];

export default function ParcelsTable({ parcels: initialParcels, currentStatus, onParcelUpdated }: ParcelsTableProps) {
  const [parcels, setParcels] = useState(initialParcels);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStatusChange = async (parcelId: string, newStatus: string) => {
    setUpdatingId(parcelId);
    setError('');

    try {
      const res = await fetch(`/api/admin/parcels/${parcelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'სტატუსის განახლებისას მოხდა შეცდომა');
        return;
      }

      const updatedParcel: Parcel = data.parcel;

      if (updatedParcel.status !== currentStatus) {
        setParcels((prev) => prev.filter((p) => p.id !== parcelId));
      } else {
        setParcels((prev) =>
          prev.map((p) => (p.id === parcelId ? updatedParcel : p))
        );
      }

      if (onParcelUpdated) {
        onParcelUpdated(updatedParcel);
      }
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (parcelId: string) => {
    if (!window.confirm('დარწმუნებული ხართ, რომ გსურთ ამანათის წაშლა?')) {
      return;
    }

    setDeletingId(parcelId);
    setError('');

    try {
      const res = await fetch(`/api/admin/parcels/${parcelId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'ამანათის წაშლისას მოხდა შეცდომა');
        return;
      }

      setParcels((prev) => prev.filter((p) => p.id !== parcelId));
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-[16px] text-red-800">{error}</p>
        </div>
      ) : null}

      {/* Mobile / small screens: card layout */}
      <div className="space-y-3 md:hidden">
        {parcels.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center text-[16px] text-gray-600">
            ჯერ არცერთი ამანათი არ არის.
          </div>
        ) : (
          parcels.map((parcel) => (
            <div
              key={parcel.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold text-black">
                    {parcel.customerName}
                  </p>
                  <p className="text-[13px] text-gray-600">
                    {parcel.user.email}
                  </p>
                </div>
                <div className="text-right text-[13px] text-gray-500">
                  <p>{parcel.createdAt}</p>
                  <p>{parcel.originCountry || '—'}</p>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-[13px] text-gray-700">
                <span className="text-gray-500">თრექინგი</span>
                <span className="text-black">{parcel.trackingNumber}</span>

                <span className="text-gray-500">რაოდენობა</span>
                <span className="text-black">{parcel.quantity}</span>

                <span className="text-gray-500">წონა</span>
                <span className="text-black">
                  {parcel.weight != null ? `${parcel.weight} kg` : '—'}
                </span>

                <span className="text-gray-500">თანხა</span>
                <span className="text-black">
                  {parcel.price.toFixed(2)} {parcel.currency || 'GEL'}
                </span>

                <span className="text-gray-500">ტელფონი</span>
                <span className="text-black">
                  {parcel.user.phone || '—'}
                </span>

                <span className="text-gray-500">ქალაქი</span>
                <span className="text-black">
                  {parcel.user.city || '—'}
                </span>

                <span className="text-gray-500">ქუჩა</span>
                <span className="text-black">
                  {parcel.user.address || '—'}
                </span>

                <span className="text-gray-500">ფაილი</span>
                <span className="flex flex-wrap gap-2">
                  <a
                    href={parcel.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-gray-900 px-2 py-1 text-[12px] font-medium text-white hover:bg-black"
                  >
                    გახსნა
                  </a>
                  <a
                    href={parcel.filePath}
                    download
                    className="rounded-md bg-gray-100 px-2 py-1 text-[12px] font-medium text-gray-900 hover:bg-gray-200"
                  >
                    ჩამოტვირთვა
                  </a>
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-gray-500">სტატუსი</span>
                <div className="flex flex-1 items-center gap-2">
                  <select
                    value={parcel.status}
                    onChange={(e) => handleStatusChange(parcel.id, e.target.value)}
                    disabled={updatingId === parcel.id || deletingId === parcel.id}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-[14px] text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(parcel.id)}
                    disabled={deletingId === parcel.id}
                    className="rounded-md bg-red-600 px-2 py-1 text-[12px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === parcel.id ? 'შლდება...' : 'წაშლა'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / larger screens: table layout */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">
                მომხმარებელი
              </th>
             
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {parcels.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-6 text-center text-[16px] text-gray-600"
                >
                  ჯერ არცერთი ამანათი არ არის.
                </td>
              </tr>
            ) : (
              parcels.map((parcel) => (
                <React.Fragment key={parcel.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 align-top text-[16px] text-black">
                      {parcel.user.email}
                      {(parcel.user.firstName || parcel.user.lastName) && (
                        <span className="block text-sm text-gray-500">
                          {parcel.user.firstName} {parcel.user.lastName}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-[14px] text-blue-600">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === parcel.id ? null : parcel.id)
                        }
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-blue-50"
                      >
                        <span>დეტალურად</span>
                        <span
                          className={`transition-transform ${
                            expandedId === parcel.id ? 'rotate-180' : ''
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                    </td>
                  </tr>
                  {expandedId === parcel.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 pb-4 pt-0 text-[14px] text-black">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <span className="text-gray-500">კლიენტი</span>
                          <span>{parcel.customerName}</span>

                          <span className="text-gray-500">თრექინგი</span>
                          <span>{parcel.trackingNumber}</span>

                          <span className="text-gray-500">რაოდენობა</span>
                          <span>{parcel.quantity}</span>

                          <span className="text-gray-500">ქვეყანა</span>
                          <span>{parcel.originCountry || '—'}</span>

                          <span className="text-gray-500">წონა</span>
                          <span>
                            {parcel.weight != null ? `${parcel.weight} kg` : '—'}
                          </span>

                          <span className="text-gray-500">თანხა</span>
                          <span>
                            {parcel.price.toFixed(2)} {parcel.currency || 'GEL'}
                          </span>

                          <span className="text-gray-500">ტელფონი</span>
                          <span>{parcel.user.phone || '—'}</span>

                          <span className="text-gray-500">ქალაქი</span>
                          <span>{parcel.user.city || '—'}</span>

                          <span className="text-gray-500">ქუჩა</span>
                          <span>{parcel.user.address || '—'}</span>

                          <span className="text-gray-500">ფაილი</span>
                          <span className="flex flex-wrap gap-2">
                            <a
                              href={parcel.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center rounded-md bg-gray-900 px-2 py-1 text-[12px] font-medium text-white hover:bg-black"
                            >
                              გახსნა
                            </a>
                            <a
                              href={parcel.filePath}
                              download
                              className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[12px] font-medium text-gray-900 hover:bg-gray-200"
                            >
                              ჩამოტვირთვა
                            </a>
                          </span>

                          <span className="text-gray-500">თარიღი</span>
                          <span>{parcel.createdAt}</span>

                          <span className="text-gray-500">სტატუსი</span>
                          <span className="flex items-center gap-2">
                            <select
                              value={parcel.status}
                              onChange={(e) =>
                                handleStatusChange(parcel.id, e.target.value)
                              }
                              disabled={updatingId === parcel.id || deletingId === parcel.id}
                              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[14px] text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleDelete(parcel.id)}
                              disabled={deletingId === parcel.id}
                              className="mt-1 rounded-md bg-red-600 px-2 py-1 text-[12px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {deletingId === parcel.id ? 'შლდება...' : 'წაშლა'}
                            </button>
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

