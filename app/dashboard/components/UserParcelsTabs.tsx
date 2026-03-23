'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { formatOriginCountryLabel } from '@/lib/formatOriginCountry';

export type UserParcel = {
  id: string;
  trackingNumber: string;
  status: string;
  price: number;
  shippingAmount: number | null;
  currency: string;
  weight: string;
  /** წონა კგ-ში — ტარიფის მიბმა */
  weightKg: number | null;
  originCountry: string | null;
  quantity: number;
  customerName: string;
  createdAt: string;
  courierServiceRequested: boolean;
  /** ადმინის მიერ დაყენებული საკურიერო გადასახადი */
  courierFeeAmount: number | null;
  /** ადმინის ძირითადი გადასახდელი (რეზერვი) */
  payableAmount: number | null;
  /** წონა × /admin/tariffs-ის კგ-ის ფასი (აქტიური ტარიფი) */
  tariffShippingPayable: number | null;
  /** იმავე ტარიფის 1 კგ-ის ფასი */
  tariffPricePerKg: number | null;
};

function baseShippingDue(p: UserParcel): number {
  if (p.tariffShippingPayable != null) return p.tariffShippingPayable;
  return p.shippingAmount ?? p.payableAmount ?? 0;
}

function totalDue(p: UserParcel): number {
  const base = baseShippingDue(p);
  const courier =
    p.courierServiceRequested && p.courierFeeAmount != null ? p.courierFeeAmount : 0;
  return Math.round((base + courier) * 100) / 100;
}

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

const COURIER_LABEL = 'საკურიერო ';
const COURIER_ERR = 'შენახვა ვერ მოხერხდა. სცადეთ თავიდან.';
/** საკურიერო ჩართულია, საკურიერო გადასახადი ჯერ არ არის დაყენებული */
const COURIER_FEE_PENDING_NOTICE =
  'ადმინისტრაცია დააყენებს საკურიერო გადასახადს.';
/** ტარიფი ვერ მოიძებნა (ქვეყანა/წონა ან /admin/tariffs-ში არ არის შესაბამისი ტარიფი) */
const PAYABLE_AMOUNT_PENDING_NOTICE =
  'ტარიფი ვერ მოიძებნა ამ ქვეყნისა და წონისთვის. დაუკავშირდით ადმინისტრაციას.';

export default function UserParcelsTabs({ parcels: parcelsProp }: Props) {
  const [activeStatus, setActiveStatus] = useState<string>('pending');
  const [parcels, setParcels] = useState<UserParcel[]>(parcelsProp);
  const [courierSavingId, setCourierSavingId] = useState<string | null>(null);
  const [courierErrorId, setCourierErrorId] = useState<string | null>(null);

  useEffect(() => {
    setParcels(parcelsProp);
  }, [parcelsProp]);

  const filtered = parcels.filter((p) => p.status === activeStatus);
  const showCourierColumn = activeStatus === 'arrived';
  const hasAnyAmountDue = filtered.some((p) => totalDue(p) > 0);
  /** წითელი გადახდა, როცა სულ გადასახდელი > 0 */
  const showPaymentColumn = showCourierColumn && hasAnyAmountDue;
  const emptyColSpan = showCourierColumn
    ? showPaymentColumn
      ? 10
      : 9
    : 7;

  const handleCourierToggle = async (parcel: UserParcel, next: boolean) => {
    if (parcel.status !== 'arrived') return;
    setCourierErrorId(null);
    setCourierSavingId(parcel.id);
    const prev = parcel.courierServiceRequested;
    setParcels((prevList) =>
      prevList.map((p) =>
        p.id === parcel.id ? { ...p, courierServiceRequested: next } : p,
      ),
    );
    try {
      const res = await fetch(`/api/dashboard/parcels/${parcel.id}/courier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierServiceRequested: next }),
      });
      if (!res.ok) {
        setParcels((prevList) =>
          prevList.map((p) =>
            p.id === parcel.id ? { ...p, courierServiceRequested: prev } : p,
          ),
        );
        setCourierErrorId(parcel.id);
        return;
      }
    } catch {
      setParcels((prevList) =>
        prevList.map((p) =>
          p.id === parcel.id ? { ...p, courierServiceRequested: prev } : p,
        ),
      );
      setCourierErrorId(parcel.id);
    } finally {
      setCourierSavingId(null);
    }
  };

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
                მომხმარებელი
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                რაოდენობა
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                საიდან
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
              {showCourierColumn && (
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                  გადასახდელი
                </th>
              )}
              {showCourierColumn && (
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                  {COURIER_LABEL}
                </th>
              )}
              {showPaymentColumn && (
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                  გადახდა
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={emptyColSpan}
                  className="px-4 py-8 text-center text-[15px] text-black"
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
                  <td className="px-4 py-3 text-[15px] text-black tabular-nums">
                    {parcel.quantity}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {formatOriginCountryLabel(parcel.originCountry)}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {parcel.weight || '—'}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {(parcel.shippingAmount ?? parcel.price).toFixed(2)}{' '}
                    {parcel.currency}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {parcel.createdAt}
                  </td>
                  {showCourierColumn && (
                    <td className="px-4 py-3 text-[15px] text-black">
                      <div className="flex max-w-[17rem] flex-col gap-1">
                        {parcel.tariffShippingPayable != null ? (
                          <>
                            <span className="text-[13px] font-medium text-black">
                              {parcel.tariffShippingPayable.toFixed(2)}{' '}
                              {parcel.currency}
                            </span>
                            {parcel.tariffPricePerKg != null &&
                              parcel.weightKg != null && (
                                <span className="text-[12px] text-gray-600">
                                  ({parcel.tariffPricePerKg.toFixed(2)}{' '}
                                  {parcel.currency}/კგ × {parcel.weightKg} კგ)
                                </span>
                              )}
                          </>
                        ) : (
                          <span
                            className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[12px] leading-snug text-rose-900"
                            role="status"
                          >
                            {PAYABLE_AMOUNT_PENDING_NOTICE}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  {showCourierColumn && (
                    <td className="px-4 py-3 text-[15px] text-black">
                      <div className="flex max-w-[14rem] flex-col gap-1.5">
                        <label className="inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            checked={parcel.courierServiceRequested}
                            disabled={courierSavingId === parcel.id}
                            onChange={(e) =>
                              handleCourierToggle(parcel, e.target.checked)
                            }
                            aria-label={COURIER_LABEL}
                          />
                        </label>
                        {parcel.courierServiceRequested &&
                          parcel.courierFeeAmount != null && (
                            <p className="text-[13px] font-medium text-black">
                              საკურიერო:{' '}
                              {parcel.courierFeeAmount.toFixed(2)} {parcel.currency}
                            </p>
                          )}
                        {parcel.courierServiceRequested &&
                          parcel.courierFeeAmount == null && (
                            <p
                              className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[12px] leading-snug text-amber-950"
                              role="status"
                            >
                              {COURIER_FEE_PENDING_NOTICE}
                            </p>
                          )}
                        {courierErrorId === parcel.id && (
                          <span className="text-[12px] text-red-600">
                            {COURIER_ERR}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  {showPaymentColumn && (
                    <td className="px-4 py-3 align-middle">
                      {totalDue(parcel) > 0 ? (
                        <div className="flex max-w-[11rem] flex-col gap-1.5">
                          <span className="text-[12px] font-medium text-black">
                            სულ: {totalDue(parcel).toFixed(2)} {parcel.currency}
                          </span>
                          <Link
                            href="/dashboard/balance"
                            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                          >
                            გადახდა
                          </Link>
                        </div>
                      ) : (
                        <span className="text-[13px] text-gray-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center text-[15px] text-black">
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
                <div className="text-right text-[13px] text-black">
                  <p>{parcel.createdAt}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[13px] text-black">
                <span className="text-black">რაოდენობა</span>
                <span className="text-black tabular-nums">{parcel.quantity}</span>

                <span className="text-black">საიდან</span>
                <span className="text-black">
                  {formatOriginCountryLabel(parcel.originCountry)}
                </span>

                <span className="text-black">წონა</span>
                <span className="text-black">{parcel.weight || '—'}</span>

                <span className="text-black">თანხა</span>
                <span className="text-black">
                  {(parcel.shippingAmount ?? parcel.price).toFixed(2)}{' '}
                  {parcel.currency}
                </span>
              </div>

              {showCourierColumn && parcel.status === 'arrived' && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/90 px-3 py-2.5">
                  <p className="text-[13px] font-semibold text-black">გადასახდელი</p>
                  {parcel.tariffShippingPayable != null ? (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-[13px] font-medium text-black">
                        {parcel.tariffShippingPayable.toFixed(2)} {parcel.currency}
                      </p>
                      {parcel.tariffPricePerKg != null &&
                        parcel.weightKg != null && (
                          <p className="text-[12px] text-gray-600">
                            ({parcel.tariffPricePerKg.toFixed(2)} {parcel.currency}
                            /კგ × {parcel.weightKg} კგ)
                          </p>
                        )}
                    </div>
                  ) : (
                    <p
                      className="mt-2 rounded-md border border-rose-200/80 bg-white/80 px-2 py-1.5 text-[12px] leading-snug text-rose-900"
                      role="status"
                    >
                      {PAYABLE_AMOUNT_PENDING_NOTICE}
                    </p>
                  )}
                </div>
              )}

              {showCourierColumn && parcel.status === 'arrived' && (
                <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2.5">
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      checked={parcel.courierServiceRequested}
                      disabled={courierSavingId === parcel.id}
                      onChange={(e) =>
                        handleCourierToggle(parcel, e.target.checked)
                      }
                    />
                    <span className="text-[14px] font-semibold text-black">
                      {COURIER_LABEL}
                    </span>
                  </label>
                  {parcel.courierServiceRequested &&
                    parcel.courierFeeAmount != null && (
                      <p className="mt-2 text-[14px] font-medium text-black">
                        საკურიერო:{' '}
                        {parcel.courierFeeAmount.toFixed(2)} {parcel.currency}
                      </p>
                    )}
                  {parcel.courierServiceRequested &&
                    parcel.courierFeeAmount == null && (
                      <p
                        className="mt-2 rounded-md border border-amber-200 bg-white/90 px-2 py-1.5 text-[12px] leading-snug text-amber-950"
                        role="status"
                      >
                        {COURIER_FEE_PENDING_NOTICE}
                      </p>
                    )}
                  {courierErrorId === parcel.id && (
                    <p className="mt-1 text-[12px] text-red-600">
                      {COURIER_ERR}
                    </p>
                  )}
                  {totalDue(parcel) > 0 && (
                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      <p className="text-[14px] font-semibold text-black">
                        სულ გადასახდელი: {totalDue(parcel).toFixed(2)}{' '}
                        {parcel.currency}
                      </p>
                      <Link
                        href="/dashboard/balance"
                        className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                      >
                        გადახდა
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
