'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

export default function NewParcelPage() {
  const t = useTranslations('parcels');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [originCountry, setOriginCountry] = useState('US');
  const [originAddress, setOriginAddress] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const w = parseFloat(weight.replace(',', '.'));
    if (isNaN(w) || w < 0) {
      setError(t('weightError'));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          originCountry: originCountry.trim() || 'US',
          originAddress: originAddress.trim() || '—',
          weight: w,
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || tCommon('error'));
        setLoading(false);
        return;
      }
      router.push(`/dashboard/tracking?code=${encodeURIComponent(data.parcel.trackingNumber)}` as '/dashboard/tracking');
      router.refresh();
    } catch {
      setError(tCommon('networkError'));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-lg px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>
            <Link
              href="/dashboard"
              className="text-[15px] font-medium text-gray-600 hover:text-black"
            >
              ← {t('back')}
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="trackingNumber" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('trackingCode')}
              </label>
              <input
                id="trackingNumber"
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('trackingPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="originCountry" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('country')}
              </label>
              <input
                id="originCountry"
                type="text"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('countryPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="originAddress" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('senderAddress')}
              </label>
              <input
                id="originAddress"
                type="text"
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('senderAddressPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="weight" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('weight')}
              </label>
              <input
                id="weight"
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('weightPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="description" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('description')}
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-70"
              >
                {loading ? tCommon('sending') : t('submit')}
              </button>
              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50"
              >
                {tCommon('cancel')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
