'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

const ORIGIN_COUNTRIES: { code: string; label: string }[] = [
  { code: 'uk', label: 'UK' },
  { code: 'us', label: 'US' },
  { code: 'cn', label: 'CN' },
  { code: 'it', label: 'IT' },
  { code: 'gr', label: 'GR' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'tr', label: 'TR' },
];

type EditParcel = {
  id: string;
  status: string;
  price: number;
  onlineShop: string | null;
  quantity: number;
  originCountry: string | null;
  weight: number | null;
  description: string | null;
  comment: string | null;
};

export default function EditDashboardParcelPage() {
  const tCommon = useTranslations('common');
  const t = useTranslations('dashboard.parcelEdit');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<{
    price: string;
    onlineShop: string;
    quantity: string;
    originCountry: string;
    weight: string;
    description: string;
    comment: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dashboard/parcels/${id}`, { method: 'GET' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || t('loadError'));
          setLoading(false);
          return;
        }
        const p = data.parcel as EditParcel;
        if (cancelled) return;
        setDraft({
          price: String(p.price ?? ''),
          onlineShop: p.onlineShop ?? '',
          quantity: String(p.quantity ?? 1),
          originCountry: p.originCountry ?? '',
          weight: p.weight != null ? String(p.weight) : '',
          description: p.description ?? '',
          comment: p.comment ?? '',
        });
      } catch {
        if (!cancelled) setError(tCommon('networkError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, tCommon]);

  const originOptions = useMemo(
    () => ORIGIN_COUNTRIES,
    [],
  );

  async function handleSave() {
    if (!id || !draft) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...(draft.price.trim() !== '' ? { price: draft.price } : {}),
        ...(draft.onlineShop.trim() !== '' ? { onlineShop: draft.onlineShop } : {}),
        ...(draft.quantity.trim() !== '' ? { quantity: draft.quantity } : {}),
        ...(draft.originCountry.trim() !== '' ? { originCountry: draft.originCountry } : {}),
        ...(draft.weight.trim() !== '' ? { weight: draft.weight } : {}),
        ...(draft.description.trim() !== '' ? { description: draft.description } : {}),
        ...(draft.comment.trim() !== '' ? { comment: draft.comment } : {}),
      };

      const res = await fetch(`/api/dashboard/parcels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || t('saveError'));
        setSaving(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(tCommon('networkError'));
      setSaving(false);
    }
  }

  return (
    <div className="bg py-8">
      <div className="mx-auto mt-24 w-full max-w-lg px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="text-[16px] font-semibold text-black md:text-[18px]">
              {t('title')}
            </h1>
            <Link
              href="/dashboard"
              className="text-[16px] font-medium text-black hover:text-black md:text-[18px]"
            >
              ← {tCommon('back')}
            </Link>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
              {error}
            </div>
          )}

          {loading || !draft ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-black">
              {tCommon('loading')}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-black">
                    {t('fields.price')}
                  </label>
                  <input
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                    inputMode="decimal"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-black">
                    {t('fields.quantity')}
                  </label>
                  <input
                    value={draft.quantity}
                    onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
                    inputMode="numeric"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[13px] font-semibold text-black">
                    {t('fields.onlineShop')}
                  </label>
                  <input
                    value={draft.onlineShop}
                    onChange={(e) => setDraft({ ...draft, onlineShop: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-black">
                    {t('fields.country')}
                  </label>
                  <select
                    value={draft.originCountry}
                    onChange={(e) => setDraft({ ...draft, originCountry: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] text-black"
                  >
                    <option value="">{t('dash')}</option>
                    {originOptions.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-black">
                    {t('fields.weight')}
                  </label>
                  <input
                    value={draft.weight}
                    onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
                    inputMode="decimal"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[13px] font-semibold text-black">
                    {t('fields.description')}
                  </label>
                  <input
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[13px] font-semibold text-black">
                    {t('fields.comment')}
                  </label>
                  <textarea
                    value={draft.comment}
                    onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
                    className="min-h-[100px] w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-black"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="w-full rounded-lg bg-black px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-70"
              >
                {saving ? t('saving') : tCommon('save')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

