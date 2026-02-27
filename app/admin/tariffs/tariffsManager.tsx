'use client';

import { useEffect, useState } from 'react';

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

export default function TariffsManager() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [tariffs, setTariffs] = useState<TariffRow[]>([]);

  const load = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tariffs', { method: 'GET' });
      const data = (await res.json()) as Partial<TariffsResponse> & { error?: string };
      if (!res.ok) throw new Error(data.error || 'ვერ მოხერხდა ტარიფების წამოღება');
      setTariffs(Array.isArray(data.tariffs) ? data.tariffs : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'დაფიქსირდა შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateTariff = async (row: TariffRow) => {
    setError('');
    setMessage('');
    setSavingId(row.id);
    try {
      const res = await fetch('/api/admin/tariffs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: row.id,
          originCountry: row.originCountry,
          destinationCountry: row.destinationCountry,
          minWeight: row.minWeight,
          maxWeight: row.maxWeight,
          pricePerKg: row.pricePerKg,
          currency: row.currency,
          isActive: row.isActive,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || 'შენახვა ვერ მოხერხდა');
      setMessage(data.message || 'შენახულია');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'შენახვა ვერ მოხერხდა');
    } finally {
      setSavingId(null);
    }
  };

  const createTariff = async () => {
    setError('');
    setMessage('');
    setSavingId('new');
    try {
      const res = await fetch('/api/admin/tariffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originCountry: 'US',
          destinationCountry: 'GE',
          minWeight: 0,
          maxWeight: null,
          pricePerKg: 0,
          currency: 'USD',
          isActive: true,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || 'დამატება ვერ მოხერხდა');
      setMessage(data.message || 'დამატებულია');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'დამატება ვერ მოხერხდა');
    } finally {
      setSavingId(null);
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

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={createTariff}
          disabled={savingId === 'new'}
          className="rounded-md bg-black px-4 py-2 text-[16px] font-semibold text-white disabled:opacity-50"
        >
          {savingId === 'new' ? 'ემატება...' : 'ტარიფის დამატება'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">Origin</th>
              <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">Dest</th>
              <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">Min kg</th>
              <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">Max kg</th>
              <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">Price / kg</th>
              <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">Curr</th>
              <th className="px-3 py-2 text-left text-[16px] font-semibold text-gray-700">Active</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {tariffs.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-[16px] text-black" colSpan={8}>
                  ტარიფები ვერ მოიძებნა
                </td>
              </tr>
            ) : (
              tariffs.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <input
                      value={t.originCountry}
                      onChange={(e) =>
                        setTariffs((prev) =>
                          prev.map((x) => (x.id === t.id ? { ...x, originCountry: e.target.value } : x))
                        )
                      }
                      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={t.destinationCountry}
                      onChange={(e) =>
                        setTariffs((prev) =>
                          prev.map((x) => (x.id === t.id ? { ...x, destinationCountry: e.target.value } : x))
                        )
                      }
                      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={t.minWeight}
                      onChange={(e) =>
                        setTariffs((prev) =>
                          prev.map((x) =>
                            x.id === t.id ? { ...x, minWeight: Number(e.target.value) } : x
                          )
                        )
                      }
                      className="w-24 rounded-md border border-gray-300 px-2 py-1 text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={t.maxWeight ?? ''}
                      onChange={(e) =>
                        setTariffs((prev) =>
                          prev.map((x) =>
                            x.id === t.id
                              ? { ...x, maxWeight: e.target.value === '' ? null : Number(e.target.value) }
                              : x
                          )
                        )
                      }
                      placeholder="∞"
                      className="w-24 rounded-md border border-gray-300 px-2 py-1 text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={t.pricePerKg}
                      onChange={(e) =>
                        setTariffs((prev) =>
                          prev.map((x) =>
                            x.id === t.id ? { ...x, pricePerKg: Number(e.target.value) } : x
                          )
                        )
                      }
                      className="w-28 rounded-md border border-gray-300 px-2 py-1 text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={t.currency}
                      onChange={(e) =>
                        setTariffs((prev) =>
                          prev.map((x) => (x.id === t.id ? { ...x, currency: e.target.value } : x))
                        )
                      }
                      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={t.isActive}
                      onChange={(e) =>
                        setTariffs((prev) =>
                          prev.map((x) => (x.id === t.id ? { ...x, isActive: e.target.checked } : x))
                        )
                      }
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => updateTariff(t)}
                      disabled={savingId === t.id}
                      className="rounded-md bg-gray-900 px-3 py-1 text-[16px] font-semibold text-white disabled:opacity-50"
                    >
                      {savingId === t.id ? 'ინახება...' : 'შენახვა'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

