'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { formatOriginCountryLabel } from '@/lib/formatOriginCountry';

export type UserParcel = {
  id: string;
  trackingNumber: string;
  status: string;
  price: number;
  shippingAmount: number | null;
  currency: string;
  shippingFormula?: string | null;
  onlineShop?: string | null;
  description?: string | null;
  comment?: string | null;
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
  /** ტაბებზე რაოდენობები — სრული სია DB-დან (groupBy), არა მხოლოდ მიმდინარე გვერდი */
  statusCounts: Partial<Record<string, number>>;
  selectedStatus: string;
  page: number;
  totalPages: number;
  /** `next-intl` Link-ს ლოკალი თავად უმატებს — მხოლოდ გზა ლოკალის გარეშე, მაგ. `/dashboard` */
  dashboardBasePath: string;
};

function listHref(base: string, status: string, pageNum: number) {
  const q = new URLSearchParams();
  q.set('status', status);
  q.set('page', String(pageNum));
  return `${base}?${q.toString()}`;
}

export default function UserParcelsTabs({
  parcels: parcelsProp,
  statusCounts,
  selectedStatus,
  page,
  totalPages,
  dashboardBasePath,
}: Props) {
  const tStatus = useTranslations('trackingPage.status');
  const t = useTranslations('dashboard.parcelsTabs');
  const statusOptions = useMemo(
    () =>
      [
        { value: 'pending', label: tStatus('pending') },
        { value: 'in_warehouse', label: tStatus('in_warehouse') },
        { value: 'in_transit', label: tStatus('in_transit') },
        { value: 'arrived', label: tStatus('arrived') },
        { value: 'stopped', label: tStatus('stopped') },
        { value: 'delivered', label: tStatus('delivered') },
      ] as { value: string; label: string }[],
    [tStatus],
  );
  const [parcels, setParcels] = useState<UserParcel[]>(parcelsProp);
  const [courierSavingId, setCourierSavingId] = useState<string | null>(null);
  const [courierErrorId, setCourierErrorId] = useState<string | null>(null);

  useEffect(() => {
    setParcels(parcelsProp);
  }, [parcelsProp]);

  const filtered = parcels;
  const showCourierColumn = selectedStatus === 'arrived';
  const showEditColumn = selectedStatus === 'pending';
  const hasAnyAmountDue = filtered.some((p) => totalDue(p) > 0);
  /** წითელი გადახდა, როცა სულ გადასახდელი > 0 */
  const showPaymentColumn = showCourierColumn && hasAnyAmountDue;
  const emptyColSpan = showCourierColumn
    ? showPaymentColumn
      ? 10
      : 9
    : showEditColumn
      ? 8
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

  const canEdit = (p: UserParcel) => p.status === 'pending';

  return (
    <div className="mt-10 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-black">{t('title')}</h2>
        <Link
          href="/dashboard/parcels/new"
          className="inline-flex w-full md:w-auto items-center justify-center rounded-lg border border-slate-200 bg-[#3a5bff] px-4 py-3 text-center text-[16px] font-semibold text-white shadow-sm transition "
        >
          {t('addParcel')}
        </Link>
      </div>
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 text-[14px] md:text-[15px]">
        {statusOptions.map((status) => {
          const isActive = selectedStatus === status.value;
          const count = statusCounts[status.value] ?? 0;

          return (
            <Link
              key={status.value}
              href={listHref(dashboardBasePath, status.value, 1)}
              scroll={false}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${isActive
                  ? 'bg-sky-900 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
            >
              <span>{status.label}</span>
              <span
                className={`min-w-[1.75rem] rounded-full px-2 py-0.5 text-center text-[12px] ${isActive ? 'bg-[#3a5bff]' : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Desktop table */}
      <div
        key={selectedStatus}
        className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                {t('cols.tracking')}
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                {t('cols.customer')}
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                {t('cols.quantity')}
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                {t('cols.from')}
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                {t('cols.weight')}
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                {t('cols.itemValue')}
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                {t('cols.date')}
              </th>
              {showEditColumn && (
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                  {t('cols.action')}
                </th>
              )}
              {showCourierColumn && (
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                  {t('cols.payable')}
                </th>
              )}
              {showCourierColumn && (
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                  {t('cols.courier')}
                </th>
              )}
              {showPaymentColumn && (
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-black">
                  {t('cols.payment')}
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
                  {t('empty')}
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
                    {parcel.price.toFixed(2)} {parcel.currency}
                  </td>
                  <td className="px-4 py-3 text-[15px] text-black">
                    {parcel.createdAt}
                  </td>
                  {showEditColumn && (
                    <td className="px-4 py-3 text-[15px] text-black">
                      {canEdit(parcel) ? (
                        <Link
                          href={`/dashboard/parcels/${parcel.id}/edit`}
                          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-black hover:bg-gray-50"
                        >
                          {t('edit')}
                        </Link>
                      ) : (
                        <span className="text-gray-400">{t('dash')}</span>
                      )}
                    </td>
                  )}
                  {showCourierColumn && (
                    <td className="px-4 py-3 text-[15px] text-black">
                      <div className="flex max-w-[17rem] flex-col gap-1">
                        {parcel.tariffShippingPayable != null ? (
                          <>
                            <span className="text-[13px] font-medium text-black">
                              {parcel.tariffShippingPayable.toFixed(2)}{' '}
                              {parcel.currency}
                            </span>
                           
                          </>
                        ) : (
                          <span
                            className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[12px] leading-snug text-rose-900"
                            role="status"
                          >
                            {t('payableAmountPendingNotice')}
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
                            aria-label={t('courierLabel')}
                          />
                        </label>
                        {parcel.courierServiceRequested &&
                          parcel.courierFeeAmount != null && (
                            <p className="text-[13px] font-medium text-black">
                              {t('courierFeePrefix')}{' '}
                              {parcel.courierFeeAmount.toFixed(2)} {parcel.currency}
                            </p>
                          )}
                        {parcel.courierServiceRequested &&
                          parcel.courierFeeAmount == null && (
                            <p
                              className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[12px] leading-snug text-amber-950"
                              role="status"
                            >
                              {t('courierFeePendingNotice')}
                            </p>
                          )}
                        {courierErrorId === parcel.id && (
                          <span className="text-[12px] text-red-600">
                            {t('courierSaveError')}
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
                            {t('totalPrefix')}{' '}
                            {totalDue(parcel).toFixed(2)} {parcel.currency}
                          </span>
                          <Link
                            href="/dashboard/balance"
                            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                          >
                            {t('pay')}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-[13px] text-gray-400">{t('dash')}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3 py-2 text-[14px] text-gray-800">
          {page > 1 ? (
            <Link
              href={listHref(dashboardBasePath, selectedStatus, page - 1)}
              scroll={false}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
            >
              {t('paginationPrev')}
            </Link>
          ) : (
            <span className="rounded-lg border border-transparent px-4 py-2 text-gray-400">
              {t('paginationPrev')}
            </span>
          )}
          <span className="tabular-nums text-[15px] font-medium text-gray-700">
            {t('paginationPage', { current: page, total: totalPages })}
          </span>
          {page < totalPages ? (
            <Link
              href={listHref(dashboardBasePath, selectedStatus, page + 1)}
              scroll={false}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
            >
              {t('paginationNext')}
            </Link>
          ) : (
            <span className="rounded-lg border border-transparent px-4 py-2 text-gray-400">
              {t('paginationNext')}
            </span>
          )}
        </div>
      )}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center text-[15px] text-black">
            {t('empty')}
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
                <span className="text-black">{t('fields.quantity')}</span>
                <span className="text-black tabular-nums">{parcel.quantity}</span>

                <span className="text-black">{t('fields.from')}</span>
                <span className="text-black">
                  {formatOriginCountryLabel(parcel.originCountry)}
                </span>

                <span className="text-black">{t('fields.weight')}</span>
                <span className="text-black">{parcel.weight || '—'}</span>

                <span className="text-black">{t('fields.itemValue')}</span>
                <span className="text-black">
                  {parcel.price.toFixed(2)} {parcel.currency}
                </span>
              </div>

              {canEdit(parcel) ? (
                <div className="mt-3">
                  <Link
                    href={`/dashboard/parcels/${parcel.id}/edit`}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-[14px] font-semibold text-black hover:bg-gray-50"
                  >
                    {t('edit')}
                  </Link>
                </div>
              ) : null}

              {showCourierColumn && parcel.status === 'arrived' && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/90 px-3 py-2.5">
                  <p className="text-[13px] font-semibold text-black">{t('payableTitle')}</p>
                  {parcel.tariffShippingPayable != null ? (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-[13px] font-medium text-black">
                        {parcel.tariffShippingPayable.toFixed(2)} {parcel.currency}
                      </p>
                      {parcel.tariffPricePerKg != null &&
                        parcel.weightKg != null && (
                          <p className="text-[12px] text-gray-600">
                            ({parcel.tariffPricePerKg.toFixed(2)} {parcel.currency}
                            /{t('kg')} × {parcel.weightKg} {t('kg')})
                          </p>
                        )}
                    </div>
                  ) : (
                    <p
                      className="mt-2 rounded-md border border-rose-200/80 bg-white/80 px-2 py-1.5 text-[12px] leading-snug text-rose-900"
                      role="status"
                    >
                      {t('payableAmountPendingNotice')}
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
                      {t('courierLabel')}
                    </span>
                  </label>
                  {parcel.courierServiceRequested &&
                    parcel.courierFeeAmount != null && (
                      <p className="mt-2 text-[14px] font-medium text-black">
                        {t('courierFeePrefix')}{' '}
                        {parcel.courierFeeAmount.toFixed(2)} {parcel.currency}
                      </p>
                    )}
                  {parcel.courierServiceRequested &&
                    parcel.courierFeeAmount == null && (
                      <p
                        className="mt-2 rounded-md border border-amber-200 bg-white/90 px-2 py-1.5 text-[12px] leading-snug text-amber-950"
                        role="status"
                      >
                        {t('courierFeePendingNotice')}
                      </p>
                    )}
                  {courierErrorId === parcel.id && (
                    <p className="mt-1 text-[12px] text-red-600">
                      {t('courierSaveError')}
                    </p>
                  )}
                  {totalDue(parcel) > 0 && (
                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      <p className="text-[14px] font-semibold text-black">
                        {t('totalDuePrefix')} {totalDue(parcel).toFixed(2)}{' '}
                        {parcel.currency}
                      </p>
                      <Link
                        href="/dashboard/balance"
                        className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                      >
                        {t('pay')}
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
