'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GB, US, CN, IT, GR, ES, FR, DE, TR } from 'country-flag-icons/react/3x2';
import { useTranslations } from 'next-intl';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type FlagComponent = (props: { title?: string; className?: string }) => React.ReactNode;

const FLAGS: Record<string, FlagComponent> = {
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

// Map form country code (uk, us, ...) to flag component key (GB, US, ...)
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

export default function AdminCreateParcelForm() {
  const router = useRouter();
  const t = useTranslations('adminParcels');
  const tCommon = useTranslations('common');
  const tAddresses = useTranslations('addresses');

  const [userEmail, setUserEmail] = useState('');
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
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement | null>(null);

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
    setSuccess(null);

    if (!userEmail.trim()) {
      setError(t('userEmailRequired'));
      return;
    }

    if (!originCountry.trim()) {
      setError(t('originCountryRequired'));
      return;
    }

    if (!description.trim()) {
      setError(t('descriptionRequired'));
      return;
    }

    if (!file) {
      setError(t('pdfRequired'));
      return;
    }
    if (file.type !== 'application/pdf') {
      setError(t('onlyPdf'));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t('maxSize'));
      return;
    }

    const priceNum = parseFloat(price.replace(',', '.'));
    const quantityNum = parseInt(quantity, 10);
    const w = weight ? parseFloat(weight.replace(',', '.')) : undefined;

    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError(t('priceInvalid'));
      return;
    }

    if (!Number.isInteger(quantityNum) || quantityNum < 1) {
      setError(t('quantityInvalid'));
      return;
    }

    if (w !== undefined && (Number.isNaN(w) || w < 0)) {
      setError(t('weightInvalid'));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('userEmail', userEmail.trim());
      formData.append('customerName', customerName.trim());
      formData.append('trackingNumber', trackingNumber.trim());
      formData.append('price', String(priceNum));
      formData.append('onlineShop', onlineShop.trim());
      formData.append('quantity', String(quantityNum));
      formData.append('originCountry', originCountry.trim());
      if (comment.trim()) formData.append('comment', comment.trim());
      if (weight.trim()) formData.append('weight', String(w));
      formData.append('description', description.trim());
      formData.append('file', file);

      const res = await fetch('/api/admin/parcels', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('createError'));
        setLoading(false);
        return;
      }

      setSuccess(t('createSuccess'));
      setUserEmail('');
      setCustomerName('');
      setTrackingNumber('');
      setPrice('');
      setOnlineShop('');
      setQuantity('1');
      setOriginCountry('');
      setComment('');
      setWeight('');
      setDescription('');
      setFile(null);

      router.refresh();
    } catch {
      setError(tCommon('networkError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-[18px] md:text-[20px] font-semibold text-black">
        {t('title')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[15px] text-green-800">
            {success}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('userEmail')}
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full placeholder:font-bold placeholder:text-black placeholder:text-[16px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder={t('userEmailPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('customerName')}
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full placeholder:font-bold placeholder:text-black placeholder:text-[16px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder={t('customerNamePlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('trackingNumber')}
            </label>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full placeholder:font-bold placeholder:text-black placeholder:text-[16px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder={t('trackingPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('price')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full placeholder:font-bold placeholder:text-black placeholder:text-[16px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder={t('pricePlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('onlineShop')}
            </label>
            <input
              type="text"
              required
              value={onlineShop}
              onChange={(e) => setOnlineShop(e.target.value)}
              className="w-full placeholder:font-bold placeholder:text-black placeholder:text-[16px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder={t('onlineShopPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('quantity')}
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full placeholder:font-bold placeholder:text-black placeholder:text-[16px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div ref={countryRef} className="relative">
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('originCountry')}
            </label>
            {/* hidden real input for required validation */}
            <input
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
              className="flex w-full items-center gap-3 rounded-lg placeholder:font-bold placeholder:text-black placeholder:text-[16px] border border-gray-300 bg-white px-3 py-2.5 text-left text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-expanded={countryOpen}
              aria-haspopup="listbox"
            >
              {originCountry ? (
                <>
                  {(() => {
                    const FlagComp = FLAGS[CODE_TO_FLAG[originCountry]];
                    return FlagComp ? (
                      <FlagComp
                        className="h-5 w-8 shrink-0 rounded object-cover"
                        title={originCountry}
                      />
                    ) : null;
                  })()}
                  <span>{tAddresses(originCountry as 'uk')}</span>
                </>
              ) : (
                <span className="text-gray-500">{t('originCountryPlaceholder')}</span>
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
                        <FlagComp
                          className="h-5 w-8 shrink-0 rounded object-cover"
                          title={code}
                        />
                      )}
                      <span>{tAddresses(code as 'uk')}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('weight')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full placeholder:font-bold placeholder:text-black placeholder:text-[16px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder={t('weightPlaceholder')}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[15px] font-semibold text-black">
            {t('description')}
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] w-full rounded-lg placeholder:font-bold placeholder:text-black placeholder:text-[16px] border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-[15px] font-semibold text-black">
            {t('comment')}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[60px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-[15px] font-semibold text-black">
            {t('pdfLabel')}
          </label>
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.type !== 'application/pdf') {
                setError(t('onlyPdf'));
                setFile(null);
                e.target.value = '';
                return;
              }
              setError(null);
              setFile(f);
            }}
            className="block w-full text-[15px] text-black file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-[15px] file:font-medium file:text-black hover:file:bg-gray-50"
          />
          <p className="mt-1 text-[14px] text-gray-600">
            {t('pdfHelp')}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-gray-900 disabled:opacity-70"
          >
            {loading ? t('creating') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

