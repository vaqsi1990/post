'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import {
  GB,
  US,
  CN,
  IT,
  GR,
  ES,
  FR,
  DE,
  TR,
} from 'country-flag-icons/react/3x2';

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

/** Map form country code (uk, us, ...) to flag component key (GB, US, ...) */
const CODE_TO_FLAG: Record<string, string> = {
  uk: 'GB',
  us: 'US',
  cn: 'CN',
  it: 'IT',
  gr: 'GR',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  tr: 'TR',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ORIGIN_COUNTRIES: { code: string }[] = [
  { code: 'uk' },
  { code: 'us' },
  { code: 'cn' },
  { code: 'it' },
  { code: 'gr' },
  { code: 'es' },
  { code: 'fr' },
  { code: 'de' },
  { code: 'tr' },
];

export default function NewParcelPage() {
  const t = useTranslations('parcels');
  const tAddresses = useTranslations('addresses');
  const tCommon = useTranslations('common');
  const tDeclaration = useTranslations('declaration');
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [price, setPrice] = useState('');
  const [onlineShop, setOnlineShop] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [originCountry, setOriginCountry] = useState('');
  const [comment, setComment] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    }
    if (countryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [countryOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!originCountry.trim()) {
      setError(t('countryRequired'));
      return;
    }
    if (!file) {
      setError(tDeclaration('fileRequired'));
      return;
    }
    if (file.type !== 'application/pdf') {
      setError(tDeclaration('onlyPdf'));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(tDeclaration('maxSize'));
      return;
    }

    const priceNum = parseFloat(price.replace(',', '.'));
    const quantityNum = parseInt(quantity, 10);
    const w = weight ? parseFloat(weight.replace(',', '.')) : undefined;
    if (isNaN(priceNum) || priceNum < 0) {
      setError(t('priceError'));
      return;
    }
    if (!Number.isInteger(quantityNum) || quantityNum < 1) {
      setError(t('quantityError'));
      return;
    }
    if (w !== undefined && (isNaN(w) || w < 0)) {
      setError(t('weightError'));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('trackingNumber', trackingNumber.trim());
      formData.append('price', String(priceNum));
      formData.append('onlineShop', onlineShop.trim());
      formData.append('quantity', String(quantityNum));
      formData.append('originCountry', originCountry.trim());
      if (comment.trim()) formData.append('comment', comment.trim());
      if (weight.trim()) formData.append('weight', String(w));
      if (description.trim()) formData.append('description', description.trim());
      formData.append('file', file);

      const res = await fetch('/api/dashboard/parcels', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || tCommon('error'));
        setLoading(false);
        return;
      }
      router.push(
        `/dashboard/tracking?code=${encodeURIComponent(
          data.parcel.trackingNumber,
        )}` as '/dashboard/tracking',
      );
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

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="customerName" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('customerName')}
              </label>
              <input
                id="customerName"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('customerNamePlaceholder')}
                suppressHydrationWarning
              />
            </div>
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
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="price" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('price')}
              </label>
              <input
                id="price"
                type="text"
                inputMode="decimal"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('pricePlaceholder')}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="onlineShop" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('onlineShop')}
              </label>
              <input
                id="onlineShop"
                type="text"
                required
                value={onlineShop}
                onChange={(e) => setOnlineShop(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('onlineShopPlaceholder')}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="quantity" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('quantity')}
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('quantityPlaceholder')}
                suppressHydrationWarning
              />
            </div>
            <div ref={countryRef} className="relative">
              <label htmlFor="originCountry" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('country')}
              </label>
              <input
                id="originCountry"
                type="text"
                readOnly
                required
                value={originCountry}
                className="hidden"
                tabIndex={-1}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => setCountryOpen((o) => !o)}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-expanded={countryOpen}
                aria-haspopup="listbox"
                aria-label={t('country')}
              >
                {originCountry ? (
                  <>
                    {(() => {
                      const FlagComp = FLAGS[CODE_TO_FLAG[originCountry]];
                      return FlagComp ? (
                        <FlagComp className="h-5 w-8 shrink-0 rounded object-cover" title={originCountry} />
                      ) : null;
                    })()}
                    <span>{tAddresses(originCountry as 'uk')}</span>
                  </>
                ) : (
                  <span className="text-gray-500">{t('countryPlaceholder')}</span>
                )}
                <span className="ml-auto text-gray-400">{countryOpen ? '▲' : '▼'}</span>
              </button>
              {countryOpen && (
                <ul
                  className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                  role="listbox"
                >
                  {ORIGIN_COUNTRIES.map(({ code }) => {
                    const FlagComp = FLAGS[CODE_TO_FLAG[code]];
                    return (
                      <li
                        key={code}
                        role="option"
                        aria-selected={originCountry === code}
                        onClick={() => {
                          setOriginCountry(code);
                          setCountryOpen(false);
                        }}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-[15px] text-black hover:bg-gray-100"
                      >
                        {FlagComp && (
                          <FlagComp className="h-5 w-8 shrink-0 rounded object-cover" title={code} />
                        )}
                        <span>{tAddresses(code as 'uk')}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
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
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="comment" className="mb-1 block text-[14px] font-medium text-gray-700">
                {t('comment')}
              </label>
              <input
                id="comment"
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('commentPlaceholder')}
                suppressHydrationWarning
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
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="declarationFile" className="mb-1 block text-[14px] font-medium text-gray-700">
                {tDeclaration('pdfFile')}
              </label>
              <input
                id="declarationFile"
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                }}
                className="block w-full text-[14px] text-gray-700 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-[14px] file:font-medium file:text-gray-700 hover:file:bg-gray-50"
              />
              <p className="mt-1 text-[13px] text-gray-500">{tDeclaration('maxFileSize')}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-70"
                suppressHydrationWarning
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
