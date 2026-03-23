'use client';

import React, { useState } from 'react';
import { formatOriginCountryLabel } from '@/lib/formatOriginCountry';

type Parcel = {
  id: string;
  trackingNumber: string;
  status: string;
  price: number;
  shippingAmount?: number | null;
  currency: string;
  weight: number | null;
  originCountry: string | null;
  quantity: number;
  customerName: string;
  createdAt: string;
  filePath: string;
  courierServiceRequested: boolean;
  courierFeeAmount: number | null;
  payableAmount: number | null;
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

const formatPhone = (phone?: string | null) => {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  // Georgian phone, store internally as 995 + 9 digits (e.g. 995599542624)
  if (digits.startsWith('995') && digits.length === 12) {
    const local = digits.slice(3); // 9 digits
    return `+995 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  // If only local 9‑digit number like 599542624
  if (digits.length === 9 && digits.startsWith('5')) {
    return `+995 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return digits;
};

export default function ParcelsTable({ parcels: initialParcels, currentStatus, onParcelUpdated }: ParcelsTableProps) {
  const [parcels, setParcels] = useState(initialParcels);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feeDraftById, setFeeDraftById] = useState<Record<string, string>>({});
  const [courierFeeSavingId, setCourierFeeSavingId] = useState<string | null>(null);
  const [payableDraftById, setPayableDraftById] = useState<Record<string, string>>({});
  const [payableSavingId, setPayableSavingId] = useState<string | null>(null);

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

  const handleSaveCourierFee = async (parcel: Parcel) => {
    const raw = feeDraftById[parcel.id];
    const trimmed = raw?.trim() ?? '';
    let value: number | null;
    if (trimmed === '') {
      value = null;
    } else {
      const n = parseFloat(trimmed.replace(',', '.'));
      if (Number.isNaN(n) || n < 0) {
        setError('საკურიერო თანხა უნდა იყოს დადებითი რიცხვი ან ცარიელი (გასუფთავება).');
        return;
      }
      value = Math.round(n * 100) / 100;
    }

    setCourierFeeSavingId(parcel.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/parcels/${parcel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierFeeAmount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'საკურიერო თანხის შენახვა ვერ მოხერხდა');
        return;
      }
      const updatedParcel: Parcel = data.parcel;
      setParcels((prev) =>
        prev.map((p) => (p.id === parcel.id ? updatedParcel : p)),
      );
      setFeeDraftById((prev) => {
        const next = { ...prev };
        delete next[parcel.id];
        return next;
      });
      if (onParcelUpdated) onParcelUpdated(updatedParcel);
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setCourierFeeSavingId(null);
    }
  };

  const handleSavePayable = async (parcel: Parcel) => {
    const raw = payableDraftById[parcel.id];
    const trimmed = raw?.trim() ?? '';
    let value: number | null;
    if (trimmed === '') {
      value = null;
    } else {
      const n = parseFloat(trimmed.replace(',', '.'));
      if (Number.isNaN(n) || n < 0) {
        setError('გადასახდელი თანხა უნდა იყოს დადებითი რიცხვი ან ცარიელი.');
        return;
      }
      value = Math.round(n * 100) / 100;
    }

    setPayableSavingId(parcel.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/parcels/${parcel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payableAmount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'გადასახდელი თანხის შენახვა ვერ მოხერხდა');
        return;
      }
      const updatedParcel: Parcel = data.parcel;
      setParcels((prev) =>
        prev.map((p) => (p.id === parcel.id ? updatedParcel : p)),
      );
      setPayableDraftById((prev) => {
        const next = { ...prev };
        delete next[parcel.id];
        return next;
      });
      if (onParcelUpdated) onParcelUpdated(updatedParcel);
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setPayableSavingId(null);
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
                <div className="text-right text-[13px] text-black">
                  <p>{parcel.createdAt}</p>
                  <p>{formatOriginCountryLabel(parcel.originCountry)}</p>
                </div>
              </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-[13px] text-black">
                <span className="text-black">თრექინგი</span>
                <span className="text-black">{parcel.trackingNumber}</span>

                <span className="text-black">რაოდენობა</span>
                <span className="text-black">{parcel.quantity}</span>

                <span className="text-black">წონა</span>
                <span className="text-black">
                  {parcel.weight != null ? `${parcel.weight} kg` : '—'}
                </span>

                <span className="text-black">თანხა</span>
                <span className="text-black">
                  {(parcel.shippingAmount ?? parcel.price).toFixed(2)} {parcel.currency || 'GEL'}
                </span>

                <span className="text-black">ტელეფონი</span>
                <span className="text-black">
                  {formatPhone(parcel.user.phone)}
                </span>

                <span className="text-black">ქალაქი</span>
                <span className="text-black">
                  {parcel.user.city || '—'}
                </span>

                <span className="text-black">ქუჩა</span>
                <span className="text-black">
                  {parcel.user.address || '—'}
                </span>

                {currentStatus === 'arrived' ? (
                  <>
                    <span className="col-span-2 mt-1 border-t border-gray-100 pt-2 text-[12px] font-semibold text-black">
                      ჩამოსული — გადასახდელი თანხა
                    </span>
                    <span className="text-black">გადასახდელი ({parcel.currency || 'GEL'})</span>
                    <span className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={
                          payableDraftById[parcel.id] !== undefined
                            ? payableDraftById[parcel.id]
                            : parcel.payableAmount != null
                              ? String(parcel.payableAmount)
                              : ''
                        }
                        onChange={(e) =>
                          setPayableDraftById((prev) => ({
                            ...prev,
                            [parcel.id]: e.target.value,
                          }))
                        }
                        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                      />
                      <button
                        type="button"
                        disabled={payableSavingId === parcel.id}
                        onClick={() => handleSavePayable(parcel)}
                        className="rounded-md bg-black px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {payableSavingId === parcel.id ? '...' : 'შენახვა'}
                      </button>
                    </span>

                    <span className="col-span-2 mt-1 border-t border-gray-100 pt-2 text-[12px] font-semibold text-amber-900">
                      საკურიერ
                      {parcel.courierServiceRequested ? (
                        <span className="ml-1 font-normal text-amber-800">
                          (მომხმარებელმა მოითხოვა)
                        </span>
                      ) : null}
                    </span>
                    <span className="text-black">საკურიერო ({parcel.currency || 'GEL'})</span>
                    <span className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={
                          feeDraftById[parcel.id] !== undefined
                            ? feeDraftById[parcel.id]
                            : parcel.courierFeeAmount != null
                              ? String(parcel.courierFeeAmount)
                              : ''
                        }
                        onChange={(e) =>
                          setFeeDraftById((prev) => ({
                            ...prev,
                            [parcel.id]: e.target.value,
                          }))
                        }
                        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                      />
                      <button
                        type="button"
                        disabled={courierFeeSavingId === parcel.id}
                        onClick={() => handleSaveCourierFee(parcel)}
                        className="rounded-md bg-black px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {courierFeeSavingId === parcel.id ? '...' : 'შენახვა'}
                      </button>
                    </span>
                  </>
                ) : null}

                <span className="text-black">ფაილი</span>
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
                <span className="text-[13px] text-black">სტატუსი</span>
                <div className="flex flex-1 flex-col md:flex-row items-center gap-2">
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
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <span>{parcel.user.email}</span>
                        {parcel.courierServiceRequested ? (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                            საკურიერო
                          </span>
                        ) : null}
                      </span>
                      {(parcel.user.firstName || parcel.user.lastName) && (
                        <span className="block text-sm text-black">
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
                      <td colSpan={2} className="px-4 pb-4 pt-0 text-black text-[14px] md:text-[18px]">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <span className="text-black">მომხმარებელი</span>
                          <span>{parcel.customerName}</span>

                          <span className="text-black">თრექინგი</span>
                          <span>{parcel.trackingNumber}</span>

                          <span className="text-black">რაოდენობა</span>
                          <span>{parcel.quantity}</span>

                          <span className="text-black">ქვეყანა</span>
                          <span>{formatOriginCountryLabel(parcel.originCountry)}</span>

                          <span className="text-black">წონა</span>
                          <span>
                            {parcel.weight != null ? `${parcel.weight} kg` : '—'}
                          </span>

                          <span className="text-black">თანხა</span>
                          <span>
                            {(parcel.shippingAmount ?? parcel.price).toFixed(2)} {parcel.currency || 'GEL'}
                          </span>

                          <span className="text-black">ტელეფონი</span>
                          <span>{formatPhone(parcel.user.phone)}</span>

                          <span className="text-black">ქალაქი</span>
                          <span>{parcel.user.city || '—'}</span>

                          <span className="text-black">ქუჩა</span>
                          <span>{parcel.user.address || '—'}</span>

                          <span className="text-black">ფაილი</span>
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

                          <span className="text-black">თარიღი</span>
                          <span>{parcel.createdAt}</span>

                          {currentStatus === 'arrived' ? (
                            <>
                              <span className="text-black">გადასახდელი</span>
                              <span className="flex flex-wrap items-center gap-2">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="0"
                                  value={
                                    payableDraftById[parcel.id] !== undefined
                                      ? payableDraftById[parcel.id]
                                      : parcel.payableAmount != null
                                        ? String(parcel.payableAmount)
                                        : ''
                                  }
                                  onChange={(e) =>
                                    setPayableDraftById((prev) => ({
                                      ...prev,
                                      [parcel.id]: e.target.value,
                                    }))
                                  }
                                  className="w-32 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                                />
                                <span className="text-black">{parcel.currency || 'GEL'}</span>
                                <button
                                  type="button"
                                  disabled={payableSavingId === parcel.id}
                                  onClick={() => handleSavePayable(parcel)}
                                  className="rounded-md bg-black px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                  {payableSavingId === parcel.id ? 'ინახება...' : 'შენახვა'}
                                </button>
                              </span>

                              <span className="text-black">საკურიერო</span>
                              <span className="flex flex-col gap-1">
                                {parcel.courierServiceRequested ? (
                                  <span className="text-[12px] text-amber-900">
                                    მომხმარებლის მოთხოვნა
                                  </span>
                                ) : null}
                                <span className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={
                                      feeDraftById[parcel.id] !== undefined
                                        ? feeDraftById[parcel.id]
                                        : parcel.courierFeeAmount != null
                                          ? String(parcel.courierFeeAmount)
                                          : ''
                                    }
                                    onChange={(e) =>
                                      setFeeDraftById((prev) => ({
                                        ...prev,
                                        [parcel.id]: e.target.value,
                                      }))
                                    }
                                    className="w-32 rounded-md border border-gray-300 px-2 py-1 text-[14px] text-black"
                                  />
                                  <span className="text-black">{parcel.currency || 'GEL'}</span>
                                  <button
                                    type="button"
                                    disabled={courierFeeSavingId === parcel.id}
                                    onClick={() => handleSaveCourierFee(parcel)}
                                    className="rounded-md bg-black px-2 py-1 text-[12px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                  >
                                    {courierFeeSavingId === parcel.id ? 'ინახება...' : 'შენახვა'}
                                  </button>
                                </span>
                              </span>
                            </>
                          ) : null}

                          <span className="text-black">სტატუსი</span>
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

