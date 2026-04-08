'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

export type EmployeeParcelRow = {
  id: string;
  status: string;
  trackingNumber: string;
  customerEmail: string;
  customerName: string;
  dateFormatted: string;
};

/** თანამშრომელი ირჩევს მხოლოდ ამ ორ სტატუსს */
const EMPLOYEE_EDITABLE_STATUSES = ['pending', 'in_transit'] as const;

type EmployeeEditableStatus = (typeof EMPLOYEE_EDITABLE_STATUSES)[number];

const ALL_KNOWN_STATUSES = [
  'pending',
  'in_transit',
  'arrived',
  'region',
  'ready_for_pickup',
  'stopped',
  'delivered',
] as const;

type KnownStatus = (typeof ALL_KNOWN_STATUSES)[number];

function isKnownStatus(s: string): s is KnownStatus {
  return (ALL_KNOWN_STATUSES as readonly string[]).includes(s);
}

function isEmployeeEditableStatus(s: string): s is EmployeeEditableStatus {
  return (EMPLOYEE_EDITABLE_STATUSES as readonly string[]).includes(s);
}

export default function EmployeeMyParcelsTable({ rows: initialRows }: { rows: EmployeeParcelRow[] }) {
  const t = useTranslations('employeeDashboard');
  const locale = useLocale();
  const [rows, setRows] = useState(initialRows);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const err = useMemo(() => {
    const isRu = locale === 'ru';
    const isEn = locale === 'en';
    return {
      statusUpdateError: isRu
        ? 'Ошибка при обновлении статуса'
        : isEn
          ? 'Failed to update status'
          : 'სტატუსის განახლებისას მოხდა შეცდომა',
      genericError: isRu
        ? 'Произошла ошибка'
        : isEn
          ? 'Something went wrong'
          : 'დაფიქსირდა შეცდომა',
    } as const;
  }, [locale]);

  const statusLabel = (value: string) => {
    if (!isKnownStatus(value)) return value;
    const keyMap: Record<
      KnownStatus,
      | 'statusPending'
      | 'statusInTransit'
      | 'statusArrived'
      | 'statusRegion'
      | 'statusReadyForPickup'
      | 'statusStopped'
      | 'statusDelivered'
    > = {
      pending: 'statusPending',
      in_transit: 'statusInTransit',
      arrived: 'statusArrived',
      region: 'statusRegion',
      ready_for_pickup: 'statusReadyForPickup',
      stopped: 'statusStopped',
      delivered: 'statusDelivered',
    };
    return t(keyMap[value]);
  };

  const selectOptions = EMPLOYEE_EDITABLE_STATUSES.map((value) => ({
    value,
    label: statusLabel(value),
  }));

  const handleStatusChange = async (parcelId: string, newStatus: string) => {
    setUpdatingId(parcelId);
    setError('');

    try {
      const res = await fetch(`/api/employee/parcels/${parcelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : err.statusUpdateError);
        return;
      }

      if (data.parcel?.id && data.parcel?.status) {
        setRows((prev) =>
          prev.map((r) => (r.id === data.parcel.id ? { ...r, status: data.parcel.status } : r)),
        );
      }
    } catch {
      setError(err.genericError);
    } finally {
      setUpdatingId(null);
    }
  };

  if (rows.length === 0) {
    return <p className="mt-4 text-[15px] text-gray-600">{t('myParcelsEmpty')}</p>;
  }

  return (
    <div className="mt-4">
      {error ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[14px] text-red-800">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[14px] text-black">
          <thead>
            <tr className="border-b border-gray-200 text-[13px] font-semibold text-gray-700">
              <th className="py-2 pr-3">{t('colTracking')}</th>
              <th className="py-2 pr-3">{t('colCustomerEmail')}</th>
              <th className="py-2 pr-3">{t('colCustomerName')}</th>
              <th className="py-2 pr-3">{t('colStatus')}</th>
              <th className="py-2">{t('colDate')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="py-2.5 pr-3 font-medium">{p.trackingNumber}</td>
                <td className="py-2.5 pr-3 break-all">{p.customerEmail}</td>
                <td className="py-2.5 pr-3">{p.customerName}</td>
                <td className="py-2.5 pr-3">
                  {isEmployeeEditableStatus(p.status) ? (
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      disabled={updatingId === p.id}
                      className="max-w-[200px] rounded-md border border-gray-300 bg-white px-2 py-1.5 text-[13px] text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      {selectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[13px] text-gray-800">{statusLabel(p.status)}</span>
                  )}
                </td>
                <td className="py-2.5 whitespace-nowrap text-gray-700">{p.dateFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
