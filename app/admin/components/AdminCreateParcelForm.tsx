'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GB, US, CN, GR, FR, TR } from 'country-flag-icons/react/3x2';
import { useTranslations } from 'next-intl';
import { parcelOriginLabelKey } from '@/lib/parcelOriginLabels';
import { REGISTRATION_CITIES } from '@/lib/georgianCities';
import {
  ADMIN_CREATE_PARCEL_MAX_FILE_BYTES,
  buildAdminCreateParcelFormSchema,
  issuesToFieldErrors,
} from '@/lib/adminCreateParcelFormSchema';

type FlagComponent = (props: { title?: string; className?: string }) => React.ReactNode;

type FieldErrors = Record<string, string>;

function FieldError({ name, errors }: { name: string; errors: FieldErrors }) {
  const msg = errors[name];
  if (!msg) return null;
  return <p className="mt-1 text-[16px] text-red-600">{msg}</p>;
}

const FLAGS: Record<string, FlagComponent> = {
  GB,
  US,
  CN,
  GR,
  FR,
  TR,
};

// Map form country code (uk, us, ...) to flag component key (GB, US, ...)
const CODE_TO_FLAG: Record<string, string> = {
  uk: 'GB',
  us: 'US',
  cn: 'CN',
  gr: 'GR',
  fr: 'FR',
  tr: 'TR',
};

const ORIGIN_COUNTRIES: { code: string }[] = [
  { code: 'uk' },
  { code: 'us' },
  { code: 'cn' },
  { code: 'gr' },
  { code: 'fr' },
  { code: 'tr' },
];

function getInitialOriginCountry(allowedOriginCountryCodes?: string[]) {
  if (allowedOriginCountryCodes?.length !== 1) return '';
  const code = allowedOriginCountryCodes[0];
  return ORIGIN_COUNTRIES.some((c) => c.code === code) ? code : '';
}

const FORM_TO_TARIFF_COUNTRY: Record<string, string> = {
  uk: 'GB',
  us: 'US',
  cn: 'CN',
  gr: 'GR',
  fr: 'FR',
  tr: 'TR',
};

const CURRENCY_BY_ORIGIN_ISO: Record<string, string> = {
  GB: 'GBP',
  US: 'USD',
  CN: 'USD',
  GR: 'EUR',
  FR: 'EUR',
  TR: 'USD',
};

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

type NbgRatesResponse = {
  rates: Record<string, number | null>;
  fetchedAt: string;
};

type AdminCreateParcelFormProps = {
  postUrl?: string;
  tariffsUrl?: string;
  successRedirect?: string;
  /** Form origin codes (uk, us, …); if set, only these appear in the selector */
  allowedOriginCountryCodes?: string[];
};

export default function AdminCreateParcelForm({
  postUrl = '/api/admin/parcels',
  tariffsUrl = '/api/admin/tariffs',
  successRedirect = '/admin/incoming',
  allowedOriginCountryCodes,
}: AdminCreateParcelFormProps = {}) {
  const router = useRouter();
  const t = useTranslations('adminParcels');
  const tCommon = useTranslations('common');
  const tParcels = useTranslations('parcels');
  const tDeclaration = useTranslations('declaration');
  const tCities = useTranslations('cities');
  const tRegister = useTranslations('register');

  const [userEmail, setUserEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [price, setPrice] = useState('');
  const [onlineShop, setOnlineShop] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [originCountry, setOriginCountry] = useState(() =>
    getInitialOriginCountry(allowedOriginCountryCodes),
  );
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const [tariffs, setTariffs] = useState<TariffRow[]>([]);
  const [nbgRates, setNbgRates] = useState<NbgRatesResponse | null>(null);

  const descriptionOptions = useMemo(() => {
    const raw = tParcels.raw('descriptionOptions');
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [tParcels]);

  const filteredDescriptions = useMemo(() => {
    const q = description.trim().toLowerCase();
    if (!q) return descriptionOptions;
    return descriptionOptions.filter((opt) => opt.toLowerCase().includes(q));
  }, [description, descriptionOptions]);

  const priceNumForUi = useMemo(() => parseFloat(price.replace(',', '.')), [price]);
  const requiresInvoicePdf = useMemo(
    () => !Number.isNaN(priceNumForUi) && priceNumForUi >= 296,
    [priceNumForUi],
  );

  const pdfLabel = useMemo(() => {
    const base = tDeclaration('pdfFile').replace(/\s*\*$/, '');
    return requiresInvoicePdf ? `${base} *` : base;
  }, [tDeclaration, requiresInvoicePdf]);

  const originCountriesList = useMemo(() => {
    if (!allowedOriginCountryCodes?.length) return ORIGIN_COUNTRIES;
    const allowed = new Set(allowedOriginCountryCodes);
    return ORIGIN_COUNTRIES.filter((c) => allowed.has(c.code));
  }, [allowedOriginCountryCodes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(tariffsUrl, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' },
        });
        const data = await res.json();
        if (!res.ok) return;
        const list = Array.isArray(data.tariffs) ? (data.tariffs as TariffRow[]) : [];
        if (!cancelled) setTariffs(list);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tariffsUrl]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/nbg/rates?codes=GBP,USD,EUR', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as NbgRatesResponse;
        if (!cancelled && data?.rates) setNbgRates(data);
      } catch {
        if (!cancelled) setNbgRates(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const calculated = useMemo(() => {
    if (!originCountry.trim() || !weight.trim()) return null;
    const w = parseFloat(weight.replace(',', '.'));
    if (Number.isNaN(w) || w <= 0) return null;

    const dbCountry = FORM_TO_TARIFF_COUNTRY[originCountry];
    if (!dbCountry) return null;

    const match = tariffs
      .filter(
        (x) =>
          x.isActive &&
          x.destinationCountry === 'GE' &&
          x.originCountry === dbCountry &&
          x.minWeight <= w &&
          (x.maxWeight == null || x.maxWeight >= w),
      )
      .sort((a, b) => b.minWeight - a.minWeight)[0];

    if (!match) return null;
    const currency =
      (CURRENCY_BY_ORIGIN_ISO[dbCountry] ?? match.currency ?? 'GEL').toUpperCase();
    const gelPer1Unit = nbgRates?.rates?.[currency] ?? null;
    const pricePerKgGel =
      gelPer1Unit != null
        ? Math.round(match.pricePerKg * gelPer1Unit * 100) / 100
        : match.pricePerKg;
    const shippingAmount = Math.round(w * pricePerKgGel * 100) / 100;
    return { shippingAmount, pricePerKgGel };
  }, [originCountry, weight, tariffs, nbgRates]);

  const parcelFormSchema = useMemo(
    () =>
      buildAdminCreateParcelFormSchema(
        {
          userEmailRequired: t('userEmailRequired'),
          userEmailInvalid: t('userEmailInvalid'),
          customerNameRequired: t('customerNameRequired'),
          trackingNumberRequired: t('trackingNumberRequired'),
          priceInvalid: t('priceInvalid'),
          onlineShopRequired: t('onlineShopRequired'),
          quantityInvalid: t('quantityInvalid'),
          originCountryRequired: t('originCountryRequired'),
          weightInvalid: t('weightInvalid'),
          descriptionRequired: t('descriptionRequired'),
          fileRequired: tDeclaration('fileRequired'),
          onlyPdf: tDeclaration('onlyPdf'),
          maxFileSize: tDeclaration('maxSize'),
        },
        {
          allowedOriginCodes: allowedOriginCountryCodes,
          getFile: () => file,
        },
      ),
    [t, tDeclaration, allowedOriginCountryCodes, file],
  );

  const clearField = (key: string) => {
    setFieldErrors((prev) => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const parsed = parcelFormSchema.safeParse({
      userEmail,
      customerName,
      trackingNumber,
      price,
      onlineShop,
      quantity,
      originCountry,
      city,
      address,
      phone,
      comment,
      weight,
      description,
    });

    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues));
      return;
    }

    const d = parsed.data;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('userEmail', d.userEmail);
      formData.append('customerName', d.customerName);
      formData.append('trackingNumber', d.trackingNumber);
      formData.append('price', String(d.price));
      formData.append('onlineShop', d.onlineShop);
      formData.append('quantity', String(d.quantity));
      formData.append('originCountry', d.originCountry);
      if (d.city) formData.append('city', d.city);
      if (d.address) formData.append('address', d.address);
      if (d.phone) formData.append('phone', d.phone);
      if (d.comment) formData.append('comment', d.comment);
      if (d.weight != null) formData.append('weight', String(d.weight));
      formData.append('description', d.description);
      if (file) formData.append('file', file);

      const res = await fetch(postUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errorCode === 'USER_EMAIL_NOT_REGISTERED') {
          setError(t('userEmailNotRegistered'));
        } else {
          setError(data.error || t('createError'));
        }
        setLoading(false);
        return;
      }

      setSuccess(t('createSuccess'));
      // If we're redirecting to incoming and we have an originCountry,
      // preselect it so the staff sees the new parcel immediately.
      const redirectUrl = (() => {
        try {
          if (!originCountry || !successRedirect.startsWith('/admin/incoming')) {
            return successRedirect;
          }
          const u = new URL(successRedirect, window.location.origin);
          u.searchParams.set('country', originCountry.trim().toLowerCase());
          u.searchParams.set('page', '1');
          u.searchParams.delete('cursor');
          return `${u.pathname}?${u.searchParams.toString()}`;
        } catch {
          return successRedirect;
        }
      })();
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError(tCommon('networkError'));
    } finally {
      setLoading(false);
    }
  }

  const fieldRing = (name: string) =>
    fieldErrors[name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-400';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-[18px] md:text-[20px] font-semibold text-black">
        {t('title')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              autoComplete="email"
              value={userEmail}
              onChange={(e) => {
                clearField('userEmail');
                setUserEmail(e.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.userEmail)}
              className={`w-full placeholder:font-normal placeholder:text-black placeholder:text-[14px] rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('userEmail')}`}
              placeholder={t('userEmailPlaceholder')}
            />
            <FieldError name="userEmail" errors={fieldErrors} />
            <p className="mt-1 text-[13px] text-gray-600">{t('userEmailRegisteredOnlyHint')}</p>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('phone')}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                clearField('phone');
                setPhone(e.target.value);
              }}
              className={`w-full placeholder:font-normal placeholder:text-black placeholder:text-[14px] rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('phone')}`}
              placeholder={t('phonePlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('customerName')}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                clearField('customerName');
                setCustomerName(e.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.customerName)}
              className={`w-full placeholder:font-normal placeholder:text-black placeholder:text-[14px] rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('customerName')}`}
              placeholder={t('customerNamePlaceholder')}
            />
            <FieldError name="customerName" errors={fieldErrors} />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('trackingNumber')}
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => {
                clearField('trackingNumber');
                setTrackingNumber(e.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.trackingNumber)}
              className={`w-full placeholder:font-normal placeholder:text-black placeholder:text-[14px] rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('trackingNumber')}`}
              placeholder={t('trackingPlaceholder')}
            />
            <FieldError name="trackingNumber" errors={fieldErrors} />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('price')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => {
                clearField('price');
                setPrice(e.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.price)}
              className={`w-full placeholder:font-normal placeholder:text-black placeholder:text-[14px] rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('price')}`}
              placeholder={t('pricePlaceholder')}
            />
            <FieldError name="price" errors={fieldErrors} />
          
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('onlineShop')}
            </label>
            <input
              type="text"
              value={onlineShop}
              onChange={(e) => {
                clearField('onlineShop');
                setOnlineShop(e.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.onlineShop)}
              className={`w-full placeholder:font-normal placeholder:text-black placeholder:text-[14px] rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('onlineShop')}`}
              placeholder={t('onlineShopPlaceholder')}
            />
            <FieldError name="onlineShop" errors={fieldErrors} />
          </div>

          <div>
            <label htmlFor="admin-parcel-city" className="mb-1 block text-[15px] font-semibold text-black">
              {t('city')}
            </label>
            <p className="mb-1 text-[14px] text-gray-600">{tRegister('cityDropdownHint')}</p>
            <select
              id="admin-parcel-city"
              value={city}
              onChange={(e) => {
                clearField('city');
                setCity(e.target.value);
              }}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('city')}`}
            >
              <option value="">{tRegister('citySelectPlaceholder')}</option>
              {REGISTRATION_CITIES.map(({ id, nameKa }) => (
                <option key={id} value={nameKa}>
                  {tCities(id)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('address')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                clearField('address');
                setAddress(e.target.value);
              }}
              className={`w-full placeholder:font-normal placeholder:text-black placeholder:text-[14px] rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('address')}`}
              placeholder={t('addressPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('quantity')}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                clearField('quantity');
                setQuantity(e.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.quantity)}
              className={`w-full placeholder:font-normal placeholder:text-black placeholder:text-[14px] rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('quantity')}`}
            />
            <FieldError name="quantity" errors={fieldErrors} />
          </div>

          <div ref={countryRef} className="relative">
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('originCountry')}
            </label>
            <button
              type="button"
              onClick={() => setCountryOpen((o) => !o)}
              className={`flex w-full items-center gap-3 rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border bg-white px-3 py-2.5 text-left text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('originCountry')}`}
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
                  <span>{tParcels(parcelOriginLabelKey(originCountry))}</span>
                </>
              ) : (
                <span className="text-black">{t('originCountryPlaceholder')}</span>
              )}
              <span className="ml-auto text-black">{countryOpen ? '▲' : '▼'}</span>
            </button>
            {countryOpen && (
              <ul
                className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                role="listbox"
              >
                {originCountriesList.map(({ code }) => {
                  const FlagComp = FLAGS[CODE_TO_FLAG[code]];
                  return (
                    <li
                      key={code}
                      role="option"
                      aria-selected={originCountry === code}
                      onClick={() => {
                        clearField('originCountry');
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
                      <span>{tParcels(parcelOriginLabelKey(code))}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <FieldError name="originCountry" errors={fieldErrors} />
          </div>

          <div>
            <label className="mb-1 block text-[15px] font-semibold text-black">
              {t('weight')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(e) => {
                clearField('weight');
                setWeight(e.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.weight)}
              className={`w-full placeholder:font-normal placeholder:text-black placeholder:text-[14px] rounded-lg border bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('weight')}`}
              placeholder={t('weightPlaceholder')}
            />
            <FieldError name="weight" errors={fieldErrors} />
            {calculated != null && (
              <p className="mt-1 text-[14px] text-black">
                {t('shippingAmountLabel')}: {calculated.shippingAmount.toFixed(2)} GEL{' '}
                <span className="text-black">({calculated.pricePerKgGel.toFixed(2)} GEL/kg)</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-parcel-description"
            className="mb-1 block text-[15px] font-semibold text-black"
          >
            {t('description')}
          </label>
          <div ref={descriptionRef} className="relative">
            <input
              id="admin-parcel-description"
              type="text"
              value={description}
              onFocus={() => setDescriptionOpen(true)}
              onClick={() => setDescriptionOpen(true)}
              onChange={(e) => {
                clearField('description');
                setDescription(e.target.value);
                setDescriptionOpen(true);
              }}
              aria-invalid={Boolean(fieldErrors.description)}
              className={`w-full rounded-lg placeholder:font-normal placeholder:text-black placeholder:text-[14px] border bg-white px-3 py-2.5 pr-10 text-[15px] text-black focus:outline-none focus:ring-2 ${fieldRing('description')}`}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={descriptionOpen}
              aria-controls="admin-parcel-description-list"
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
                id="admin-parcel-description-list"
                className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                role="listbox"
              >
                {filteredDescriptions.length === 0 ? (
                  <li className="px-3 py-2.5 text-[15px] text-gray-500">
                    {tParcels('descriptionNoResults')}
                  </li>
                ) : (
                  filteredDescriptions.map((opt) => (
                    <li
                      key={opt}
                      role="option"
                      aria-selected={description === opt}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        clearField('description');
                        setDescription(opt);
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
          <FieldError name="description" errors={fieldErrors} />
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
          <label htmlFor="admin-declaration-file" className="mb-1 block text-[15px] font-semibold text-black">
            {pdfLabel}
          </label>
          <input
            id="admin-declaration-file"
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              clearField('file');
              const f = e.target.files?.[0] ?? null;
              if (f && f.type !== 'application/pdf') {
                setFieldErrors((prev) => ({ ...prev, file: tDeclaration('onlyPdf') }));
                setFile(null);
                e.target.value = '';
                return;
              }
              if (f && f.size > ADMIN_CREATE_PARCEL_MAX_FILE_BYTES) {
                setFieldErrors((prev) => ({ ...prev, file: tDeclaration('maxSize') }));
                setFile(null);
                e.target.value = '';
                return;
              }
              setFile(f);
            }}
            aria-invalid={Boolean(fieldErrors.file)}
            className={`block w-full rounded-lg border px-3 py-2 text-[15px] text-black file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-[15px] file:font-medium file:text-black hover:file:bg-gray-50 ${fieldRing('file')}`}
          />
          <FieldError name="file" errors={fieldErrors} />
          <p className="mt-1 text-[14px] font-medium text-black">{tDeclaration('maxFileSize')}</p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#3a5bff] px-5 py-2.5 text-[15px] font-semibold text-white disabled:opacity-70"
          >
            {loading ? t('creating') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

