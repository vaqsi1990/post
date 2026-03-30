'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { parcelOriginLabelKey } from '@/lib/parcelOriginLabels';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
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

const DESCRIPTION_OPTIONS = [
  'ავტო ნაწილები',
  'ავტომანქანის ფარი',
  'ავტომანქანის საბურავი',
  'ელექტრო ხელს ინსტრუმენტები',
  'კომპიუტერი / ლეპტოპი და მათი ნაწილები',
  'ლეპტოპი და ფოტო აპარატურა, დრონი',
  'ტელეფონი და პატარა მოწყობილობები',
  'სხვადასხვა ელექტრონული მოწყობილობები',
  'მუსიკალური ინსტრუმენტები და მათი ნაწილები',
  'მინის სარკე',
  'მინის ჭურჭელი',
  'მინის ნაწარმი',
  'წიგნები',
  'ტექსტილი',
  'ტყავი',
  'სათამაშო კონსოლი',
  'სპორტული ინვენტარი',
  'პარფიუმერია და კოსმეტიკა',
  'სუნამო',
  'თმის მოვლის საშუალებები',
  'ჩანთები, აქსესუარები, სამკაული',
  'ჩანთები და აქსესუარები',
  'ფეხსაცმელი',
  'საკვები დანამატები',
  'ვაპის დანამატები',
  'მცენარეები',
  'ნაბადი პროდუქცია',
] as const;

export default function NewParcelPage() {
  const t = useTranslations('parcels');
  const tCommon = useTranslations('common');
  const tDeclaration = useTranslations('declaration');
  const router = useRouter();
  const { data: session } = useSession();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [price, setPrice] = useState('');
  const [onlineShop, setOnlineShop] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [originCountry, setOriginCountry] = useState('');
  const [comment, setComment] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [tariffs, setTariffs] = useState<Record<string, number>>({});
  const countryRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const priceNumForUi = useMemo(() => parseFloat(price.replace(',', '.')), [price]);
  const requiresInvoicePdf = useMemo(
    () => !Number.isNaN(priceNumForUi) && priceNumForUi >= 296,
    [priceNumForUi],
  );
  const resolvedCustomerName = useMemo(() => {
    const firstName = (session?.user as any)?.firstName as string | undefined;
    const lastName = (session?.user as any)?.lastName as string | undefined;
    const email = (session?.user as any)?.email as string | undefined;
    const full = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    return full || email || '';
  }, [session]);
  const pdfLabel = useMemo(() => {
    const base = tDeclaration('pdfFile').replace(/\s*\*$/, '');
    return requiresInvoicePdf ? `${base} *` : base;
  }, [tDeclaration, requiresInvoicePdf]);
  const trackingLabel = useMemo(() => `${t('trackingCode').replace(/\s*\*$/, '')} *`, [t]);
  const onlineShopLabel = useMemo(() => `${t('onlineShop').replace(/\s*\*$/, '')} *`, [t]);
  const quantityLabel = useMemo(() => t('quantity').replace(/\s*\*$/, ''), [t]);
  const weightLabel = useMemo(() => `${t('weight').replace(/\s*\*$/, '')}  *`, [t]);

  const parcelFormSchema = useMemo(() => {
    const numFromString = (v: unknown) => {
      if (typeof v === 'string') {
        const trimmed = v.trim();
        if (!trimmed) return undefined;
        return parseFloat(trimmed.replace(',', '.'));
      }
      return v;
    };
    const intFromString = (v: unknown) => {
      if (typeof v === 'string') {
        const trimmed = v.trim();
        if (!trimmed) return undefined;
        return parseInt(trimmed, 10);
      }
      return v;
    };
    return z
      .object({
        trackingNumber: z.string().trim().min(1, t('trackingCode') + ' აუცილებელია'),
        price: z.preprocess(numFromString, z.number({ message: t('priceError') }).min(0, t('priceError'))),
        onlineShop: z.string().trim().min(1, t('onlineShop') + ' აუცილებელია'),
        quantity: z
          .preprocess(intFromString, z.number({ message: t('quantityError') }).int().min(1, t('quantityError')))
          .optional(),
        originCountry: z.string().trim().min(1, t('countryRequired')),
        weight: z
          .preprocess(numFromString, z.number({ message: t('weightError') }).min(0.001, t('weightError')))
          .optional(),
        description: z.string().trim().min(1, 'აღწერა აუცილებელია'),
        comment: z.string().trim().optional(),
        file: z.any().optional(),
      })
      .superRefine((val, ctx) => {
        if (val.price >= 296 && !val.file) {
          ctx.addIssue({ code: 'custom', path: ['file'], message: tDeclaration('fileRequired') });
        }
        if (val.file) {
          const f = val.file as File;
          if (f.type !== 'application/pdf') {
            ctx.addIssue({ code: 'custom', path: ['file'], message: tDeclaration('onlyPdf') });
          }
          if (f.size > MAX_FILE_SIZE) {
            ctx.addIssue({ code: 'custom', path: ['file'], message: tDeclaration('maxSize') });
          }
        }
      });
  }, [t, tDeclaration]);

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/dashboard/tariffs', { cache: 'no-store', credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.tariffs && !cancelled) setTariffs(data.tariffs);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const calculatedPrice = useMemo(() => {
    if (!originCountry || !weight.trim()) return null;
    const w = parseFloat(weight.replace(',', '.'));
    if (Number.isNaN(w) || w <= 0) return null;
    const pricePerKg = tariffs[originCountry];
    if (pricePerKg == null) return null;
    return Math.round(w * pricePerKg * 100) / 100;
  }, [originCountry, weight, tariffs]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
      if (descriptionRef.current && !descriptionRef.current.contains(e.target as Node)) {
        setDescriptionOpen(false);
      }
    }
    if (countryOpen || descriptionOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [countryOpen, descriptionOpen]);

  const filteredDescriptions = useMemo(() => {
    const q = description.trim().toLowerCase();
    if (!q) return DESCRIPTION_OPTIONS;
    return DESCRIPTION_OPTIONS.filter((opt) => opt.toLowerCase().includes(q));
  }, [description]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = parcelFormSchema.safeParse({
      trackingNumber,
      price,
      onlineShop,
      quantity,
      originCountry,
      weight,
      description,
      comment,
      file,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = (issue.path?.[0] as string | undefined) ?? 'form';
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('customerName', resolvedCustomerName.trim());
      formData.append('trackingNumber', trackingNumber.trim());
      formData.append('price', String(parsed.data.price));
      formData.append('onlineShop', onlineShop.trim());
      if (parsed.data.quantity != null) formData.append('quantity', String(parsed.data.quantity));
      formData.append('originCountry', originCountry.trim());
      if (comment.trim()) formData.append('comment', comment.trim());
      if (parsed.data.weight != null) formData.append('weight', String(parsed.data.weight));
      formData.append('description', description.trim());
      if (file) formData.append('file', file);

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
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(tCommon('networkError'));
      setLoading(false);
    }
  }

  return (
    <div className="  bg py-8">
      <div className="mx-auto mt-24 w-full max-w-lg px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-[16px] md:text-[18px] font-semibold text-black">{t('title')}</h1>
            <Link
              href="/dashboard"
              className="text-[16px] md:text-[18px] font-medium text-black hover:text-black"
            >
              ← {t('back')}
            </Link>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4" suppressHydrationWarning>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="trackingNumber" className="mb-1 block text-[15px] md:text-[18px] font-bold text-black">
                {trackingLabel}
              </label>
              <input
                id="trackingNumber"
                type="text"
                value={trackingNumber}
                onChange={(e) => {
                  setTrackingNumber(e.target.value);
                  clearFieldError('trackingNumber');
                }}
                className="w-full rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('trackingPlaceholder')}
                suppressHydrationWarning
              />
              {fieldErrors.trackingNumber && (
                <p className="mt-1 text-[13px] text-red-600">{fieldErrors.trackingNumber}</p>
              )}
            </div>
            <div>
              <label htmlFor="price" className="mb-1 block text-[15px] md:text-[18px] font-bold text-black">
                {t('itemValue')} *
              </label>
              <input
                id="price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  clearFieldError('price');
                  clearFieldError('file');
                }}
                className="w-full rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('pricePlaceholder')}
                suppressHydrationWarning
              />
              {fieldErrors.price && (
                <p className="mt-1 text-[13px] text-red-600">{fieldErrors.price}</p>
              )}
          
            </div>
            <div>
              <label htmlFor="onlineShop" className="mb-1 block text-[15px] md:text-[18px] font-bold text-black">
                {onlineShopLabel}
              </label>
              <input
                id="onlineShop"
                type="text"
                value={onlineShop}
                onChange={(e) => {
                  setOnlineShop(e.target.value);
                  clearFieldError('onlineShop');
                }}
                className="w-full rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('onlineShopPlaceholder')}
                suppressHydrationWarning
              />
              {fieldErrors.onlineShop && (
                <p className="mt-1 text-[13px] text-red-600">{fieldErrors.onlineShop}</p>
              )}
            </div>
            <div>
              <label htmlFor="quantity" className="mb-1 block text-[15px] md:text-[18px] font-bold text-black">
                {quantityLabel}
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  clearFieldError('quantity');
                }}
                className="w-full rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('quantityPlaceholder')}
                suppressHydrationWarning
              />
              {fieldErrors.quantity && (
                <p className="mt-1 text-[13px] text-red-600">{fieldErrors.quantity}</p>
              )}
            </div>
            <div ref={countryRef} className="relative">
              <label htmlFor="originCountry" className="mb-1 block text-[15px] md:text-[18px] font-bold text-black">
                {t('country')} *
              </label>
              <input
                id="originCountry"
                type="text"
                readOnly
                value={originCountry}
                className="hidden border"
                tabIndex={-1}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => setCountryOpen((o) => !o)}
                className="flex w-full items-center gap-3 rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border border-gray-300 bg-white px-3 py-2.5 text-left text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                    <span>{t(parcelOriginLabelKey(originCountry))}</span>
                  </>
                ) : (
                  <span className="text-black">{t('countryPlaceholder')}</span>
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
                          clearFieldError('originCountry');
                        }}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-[15px] text-black hover:bg-gray-100"
                      >
                        {FlagComp && (
                          <FlagComp className="h-5 w-8 shrink-0 rounded object-cover" title={code} />
                        )}
                        <span>{t(parcelOriginLabelKey(code))}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {fieldErrors.originCountry && (
                <p className="mt-1 text-[13px] text-red-600">{fieldErrors.originCountry}</p>
              )}
            </div>
            <div>
              <label htmlFor="weight" className="mb-1 block text-[15px] md:text-[18px] font-bold text-black">
                {weightLabel}
              </label>
              <input
                id="weight"
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  clearFieldError('weight');
                }}
                className="w-full rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t('weightPlaceholder')}
                suppressHydrationWarning
              />
              {fieldErrors.weight && (
                <p className="mt-1 text-[13px] text-red-600">{fieldErrors.weight}</p>
              )}
              {calculatedPrice != null && (
                <p className="mt-1.5 text-[15px] font-medium text-black">
                  {t('calculatedPrice')}: {calculatedPrice.toFixed(2)} GEL
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-[15px] md:text-[18px] font-bold text-black"
              >
                {t('description')} *
              </label>
              <div ref={descriptionRef} className="relative">
                <input
                  id="description"
                  type="text"
                  value={description}
                  onFocus={() => setDescriptionOpen(true)}
                  onClick={() => setDescriptionOpen(true)}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearFieldError('description');
                    setDescriptionOpen(true);
                  }}
                  className="w-full rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  suppressHydrationWarning
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={descriptionOpen}
                  aria-controls="parcel-description-list"
                />
                <button
                  type="button"
                  onClick={() => setDescriptionOpen((o) => !o)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label="Toggle description list"
                  tabIndex={-1}
                >
                  {descriptionOpen ? '▲' : '▼'}
                </button>
                {descriptionOpen && (
                  <ul
                    id="parcel-description-list"
                    className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    role="listbox"
                  >
                    {filteredDescriptions.length === 0 ? (
                      <li className="px-3 py-2.5 text-[15px] text-gray-500">ვერ მოიძებნა</li>
                    ) : (
                      filteredDescriptions.map((opt) => (
                        <li
                          key={opt}
                          role="option"
                          aria-selected={description === opt}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setDescription(opt);
                            clearFieldError('description');
                            setDescriptionOpen(false);
                          }}
                          className="cursor-pointer px-3 py-2.5 text-[15px] text-black hover:bg-gray-100"
                        >
                          {opt}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              {fieldErrors.description && (
                <p className="mt-1 text-[13px] text-red-600">{fieldErrors.description}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="comment"
                className="mb-1 block text-[15px] md:text-[18px] font-bold text-black"
              >
                {t('comment')}
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[90px]"
                placeholder={t('commentPlaceholder')}
                suppressHydrationWarning
              />
            </div>

            <div>
              <label htmlFor="declarationFile" className="mb-1 block text-[15px] md:text-[18px] font-bold text-black">
                {pdfLabel}
              </label>
              <input
                id="declarationFile"
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f && f.type !== 'application/pdf') {
                    setError(tDeclaration('onlyPdf'));
                    setFile(null);
                    e.target.value = '';
                    return;
                  }
                  setError(null);
                  setFile(f);
                  clearFieldError('file');
                }}
                className="block w-full text-[15px] md:text-[18px] text-black file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-[15px] md:text-[18px] file:font-medium file:text-black hover:file:bg-gray-50"
              />
              {fieldErrors.file && (
                <p className="mt-1 text-[13px] text-red-600">{fieldErrors.file}</p>
              )}
             
              <p className="mt-1 text-[16px] md:text-[20px] text-black font-medium">{tDeclaration('maxFileSize')}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#3a5bff] text-white px-5 py-2.5 text-[15px] font-semibold   focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70"
                suppressHydrationWarning
              >
                {loading ? tCommon('sending') : t('submit')}
              </button>
              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-[15px] font-medium text-black "
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
