'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GB, US, CN, IT, GR, ES, FR, DE, TR } from 'country-flag-icons/react/3x2';

const FLAGS: Record<string, React.ComponentType<{ title?: string; className?: string }>> = {
  GB,
  US,
  CN,
  IT,
  GR,
  ES,
  FR,
  DE,
  TR,
};

const ORIGIN_COUNTRIES: { code: string; nameKey: string }[] = [
  { code: 'GB', nameKey: 'uk' },
  { code: 'US', nameKey: 'us' },
  { code: 'CN', nameKey: 'cn' },
  { code: 'IT', nameKey: 'it' },
  { code: 'GR', nameKey: 'gr' },
  { code: 'ES', nameKey: 'es' },
  { code: 'FR', nameKey: 'fr' },
  { code: 'DE', nameKey: 'de' },
  { code: 'TR', nameKey: 'tr' },
];

type TariffRow = {
  id: string;
  originCountry: string;
  destinationCountry: string;
  minWeight: number;
  maxWeight: number | null;
  pricePerKg: number;
  currency: string;
  isActive: boolean;
};

type TariffsResponse = {
  tariffs: TariffRow[];
};

type CountryRow = {
  code: string;
  nameKey: string;
  tariffId: string | null;
  pricePerKg: number | '';
};

export default function TariffsManager() {
  const t = useTranslations('addresses');
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState<CountryRow[]>([]);
  const pricesRef = useRef<Record<string, number | ''>>({});

  const load = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tariffs', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = (await res.json()) as Partial<TariffsResponse> & { error?: string };
      if (!res.ok) throw new Error(data.error || 'ვერ მოხერხდა ტარიფების წამოღება');
      const tariffs: TariffRow[] = Array.isArray(data.tariffs) ? data.tariffs : [];

      const built = ORIGIN_COUNTRIES.map(({ code, nameKey }) => {
        const candidates = tariffs.filter(
          (x) =>
            x.originCountry.toUpperCase() === code &&
            x.minWeight === 0
        );
        const tariff =
          candidates.find((x) => x.maxWeight == null) ?? candidates[0] ?? null;
        return {
          code,
          nameKey,
          tariffId: tariff?.id ?? null,
          pricePerKg: tariff != null ? tariff.pricePerKg : ('' as const),
        };
      });
      built.forEach((r) => {
        pricesRef.current[r.code] = r.pricePerKg;
      });
      setRows(built);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'დაფიქსირდა შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveRow = async (row: CountryRow) => {
    setError('');
    setMessage('');
    setSavingCode(row.code);
    const rawPrice = pricesRef.current[row.code] ?? row.pricePerKg;
    const price = rawPrice === '' ? 0 : Number(rawPrice);
    if (rawPrice !== '' && (Number.isNaN(price) || price < 0)) {
      setError('ფასი უნდა იყოს არაუარყოფითი რიცხვი');
      setSavingCode(null);
      return;
    }
    try {
      if (row.tariffId) {
        const res = await fetch('/api/admin/tariffs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include',
          body: JSON.stringify({
            id: row.tariffId,
            originCountry: row.code,
            destinationCountry: 'GE',
            minWeight: 0,
            maxWeight: null,
            pricePerKg: price,
            currency: 'GEL',
            isActive: true,
          }),
        });
        const data = (await res.json()) as { error?: string; message?: string };
        if (!res.ok) throw new Error(data.error || 'შენახვა ვერ მოხერხდა');
        setMessage(data.message || 'შენახულია');
      } else {
        const res = await fetch('/api/admin/tariffs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include',
          body: JSON.stringify({
            originCountry: row.code,
            destinationCountry: 'GE',
            minWeight: 0,
            maxWeight: null,
            pricePerKg: price,
            currency: 'GEL',
            isActive: true,
          }),
        });
        const data = (await res.json()) as { error?: string; message?: string };
        if (!res.ok) throw new Error(data.error || 'დამატება ვერ მოხერხდა');
        setMessage(data.message || 'დამატებულია');
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'შენახვა ვერ მოხერხდა');
    } finally {
      setSavingCode(null);
    }
  };

  const updatePrice = (code: string, value: number | '') => {
    pricesRef.current[code] = value;
    setRows((prev) =>
      prev.map((r) => (r.code === code ? { ...r, pricePerKg: value } : r))
    );
  };

  const resetToZero = async (row: CountryRow) => {
    setError('');
    setMessage('');
    setActionBusy(`${row.code}_reset`);
    try {
      if (row.tariffId) {
        const res = await fetch('/api/admin/tariffs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include',
          body: JSON.stringify({
            id: row.tariffId,
            originCountry: row.code,
            destinationCountry: 'GE',
            minWeight: 0,
            maxWeight: null,
            pricePerKg: 0,
            currency: 'GEL',
            isActive: true,
          }),
        });
        const data = (await res.json()) as { error?: string; message?: string };
        if (!res.ok) throw new Error(data.error || 'განულება ვერ მოხერხდა');
        setMessage('განულდა');
      } else {
        pricesRef.current[row.code] = '';
        setRows((prev) =>
          prev.map((r) => (r.code === row.code ? { ...r, pricePerKg: '' as const } : r))
        );
        setMessage('განულდა');
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'განულება ვერ მოხერხდა');
    } finally {
      setActionBusy(null);
    }
  };

  const deleteRow = async (row: CountryRow) => {
    if (!row.tariffId) {
      pricesRef.current[row.code] = '';
      setRows((prev) =>
        prev.map((r) => (r.code === row.code ? { ...r, pricePerKg: '' as const, tariffId: null } : r))
      );
      setMessage('წაიშალა');
      return;
    }
    setError('');
    setMessage('');
    setActionBusy(`${row.code}_delete`);
    try {
      const res = await fetch('/api/admin/tariffs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        credentials: 'include',
        body: JSON.stringify({ id: row.tariffId }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || 'წაშლა ვერ მოხერხდა');
      setMessage(data.message || 'წაიშალა');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'წაშლა ვერ მოხერხდა');
    } finally {
      setActionBusy(null);
    }
  };

  if (loading) return <p className="text-[16px] text-black">იტვირთება...</p>;
  if (error) return <p className="text-[16px] text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-[16px] text-green-800">{message}</p>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">
                ქვეყანა
              </th>
              <th className="px-3 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">
                ფასი 1 კგ (GEL)
              </th>
              <th className="px-3 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">
                მოქმედებები
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} className="border-b last:border-0">
                <td className="px-3 py-2 text-[16px] text-black">
                  <span className="inline-flex items-center gap-2">
                    {(() => {
                      const Flag = FLAGS[row.code];
                      return Flag ? (
                        <Flag
                          title={t(row.nameKey as 'uk')}
                          className="h-5 w-8 shrink-0 rounded object-cover shadow-sm"
                        />
                      ) : null;
                    })()}
                    <span>{t(row.nameKey as 'uk')}</span>
                  </span>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={row.pricePerKg === '' ? '' : row.pricePerKg}
                    onChange={(e) =>
                      updatePrice(
                        row.code,
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    placeholder=""
                    className="w-28 rounded-md border border-gray-300 px-2 py-1 text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveRow(row)}
                      disabled={savingCode === row.code}
                      className="rounded-md bg-gray-900 px-3 py-1.5 text-[14px] font-semibold text-white disabled:opacity-50"
                    >
                      {savingCode === row.code ? 'ინახება...' : 'შენახვა'}
                    </button>
                    <button
                      type="button"
                      onClick={() => resetToZero(row)}
                      disabled={actionBusy === `${row.code}_reset`}
                      className="rounded-md border border-amber-600 bg-amber-50 px-3 py-1.5 text-[14px] font-semibold text-amber-800 disabled:opacity-50"
                    >
                      {actionBusy === `${row.code}_reset` ? '...' : 'განულება'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRow(row)}
                      disabled={actionBusy === `${row.code}_delete`}
                      className="rounded-md border border-red-600 bg-red-50 px-3 py-1.5 text-[14px] font-semibold text-red-800 disabled:opacity-50"
                    >
                      {actionBusy === `${row.code}_delete` ? '...' : 'წაშლა'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
