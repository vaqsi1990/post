import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type React from 'react';
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

// Desktop: show Georgian next to flag, English below it.
const COUNTRY_KA: Record<string, string> = {
  GB: 'დიდი ბრიტანეთი',
  US: 'ამერიკა ',
  CN: 'ჩინეთი',
  IT: 'იტალია',
  GR: 'საბერძნეთი',
  ES: 'ესპანეთი',
  FR: 'საფრანგეთი',
  DE: 'გერმანია',
  TR: 'თურქეთი',
};

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

type AddressRow = {
  countryKey: string;
  countryCode: string;
  cityKey?: string;
  adress: string;
  postalCode: string;
  phone?: string;
};

// Only these 4 countries should have real data. Others should be blank.
const ADDRESS_ROWS: AddressRow[] = [
  { countryKey: 'uk', countryCode: 'GB', adress: '', postalCode: '' },
  { countryKey: 'us', countryCode: 'US', adress: '', postalCode: '' },
  { countryKey: 'cn', countryCode: 'CN', adress: '', postalCode: '' },

  {
    countryKey: 'it',
    countryCode: 'IT',
    cityKey: 'paris',
    adress: '7 bis rue decres',
    postalCode: '75014',
    phone: '+33 7 53 19 86 83',
  },

  {
    countryKey: 'gr', countryCode: 'GR', cityKey: 'paris',
    adress: '7 bis rue decres',
    postalCode: '75014',
    phone: '+33 7 53 19 86 83',
  },
  {
    countryKey: 'es',
    countryCode: 'ES',
    cityKey: 'paris',
    adress: '7 bis rue decres',
    postalCode: '75014',
    phone: '+33 7 53 19 86 83',
  },
  {
    countryKey: 'fr',
    countryCode: 'FR',
    cityKey: 'paris',
    adress: '7 bis rue decres',
    postalCode: '75014',
    phone: '+33 7 53 19 86 83',
  },
  {
    countryKey: 'de',
    countryCode: 'DE',
    cityKey: 'paris',
    adress: '7 bis rue decres',
    postalCode: '75014',
    phone: '+33 7 53 19 86 83',
  },

  { countryKey: 'tr', countryCode: 'TR', adress: '', postalCode: '' },
];

export default async function DashboardAddressesPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations('common');
  const tAddr = await getTranslations('addresses');

  if (!session?.user) redirect(`/${locale}/login`);
  if (session.user.role === 'ADMIN') redirect(`/${locale}/admin`);

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, roomNumber: true },
  });

  const userFirstName = user?.firstName ?? '';
  const userLastName = user?.lastName ?? '';
  const hasUserName = Boolean(userFirstName || userLastName);
  const userRoomNumber = user?.roomNumber ?? '';

  const addressList = ADDRESS_ROWS.map((row) => ({
    countryCode: row.countryCode,
    country: tAddr(row.countryKey),
    city: row.cityKey ? tAddr(row.cityKey) : '',
    adress: row.adress,
    postalCode: row.postalCode,
    phone: row.phone,
  }));

  return (
    <div className="bg-[#010002] py-4 sm:py-8 text-white">
      <div className="mx-auto mt-16 sm:mt-20 md:mt-24 w-full max-w-6xl px-3 sm:px-4">
        <main className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#121311] p-4 sm:p-6">
          <div className="pb-4 sm:pb-6 border-b border-white/10">
            <Link href="/dashboard" className="text-[16px] md:text-[18px] font-medium text-white hover:text-white/90">
              ← {t('back')}
            </Link>
          </div>
          <div className="pt-4 sm:pt-6">
            {hasUserName ? (
              <div className="text-white/90 font-semibold mb-2">
                {userFirstName ? <div>{userFirstName}</div> : null}
                {userLastName ? <div>{userLastName}</div> : null}
              </div>
            ) : null}
            <h1 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">{tAddr('title')}</h1>

            <div className="md:hidden space-y-3">
              {addressList.map((row, i) => (
                <div key={i}>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Flag = FLAGS[row.countryCode];
                          return Flag ? (
                            <Flag
                              title={row.country}
                              className="h-8 w-auto rounded object-cover shadow-md ring-1 ring-white/10"
                            />
                          ) : null;
                        })()}
                        <span className="text-white/90 text-[14px] font-semibold whitespace-nowrap">
                          {COUNTRY_KA[row.countryCode] ?? row.country}
                        </span>
                      </div>
                    </div>
                    {hasUserName ? (
                      <>
                        <div className="flex justify-between gap-2 mb-1">
                          <span className="text-white/90 font-semibold shrink-0">{tAddr('name')}</span>
                          <span className="text-white/90 text-right break-all">{userFirstName} </span>
                        </div>
                        <div className="flex justify-between gap-2 mb-1">
                          <span className="text-white/90 font-semibold shrink-0">{tAddr('lastname')}</span>
                          <span className="text-white/90 text-right break-all">{userLastName} </span>
                        </div>
                      </>
                    ) : null}
                    <div className="flex justify-between gap-2 mb-1">
                      <span className="text-white/90 font-semibold shrink-0">{tAddr('street')}</span>
                      <span className="text-white/90 text-right break-all">{row.adress}</span>
                    </div>
                    <div className="flex justify-between gap-2 mb-1">
                      <span className="text-white/90 font-semibold shrink-0">{tAddr('street2')}</span>
                      <span className="text-white/90 text-right break-words">{userRoomNumber}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-white/90 font-semibold shrink-0">{tAddr('country')}</span>

                      <span className="text-white/90 text-[14px] font-semibold">{row.country}</span>
                    </div>
                    <div className="flex justify-between gap-2 mb-1">
                      <span className="text-white/90 font-semibold shrink-0">{tAddr('city')}</span>
                      <span className="text-white/90 text-right">{row.city}</span>
                    </div>

                    <div className="flex justify-between gap-2">
                      <span className="text-white/90 font-semibold shrink-0">{tAddr('postalCode')}</span>
                      <span className="text-white/90 font-medium">{row.postalCode}</span>
                    </div>
                    {row.phone ? (
                      <div className="flex justify-between gap-2 mt-1">
                        <span className="text-white/90 font-semibold shrink-0">{tAddr('phone')}</span>
                        <span className="text-white/90 font-medium">{row.phone}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: show each country as its own card */}
            <div className="hidden md:grid md:grid-cols-3 gap-4">
              {addressList.map((row, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {(() => {
                      const Flag = FLAGS[row.countryCode];
                      return Flag ? (
                        <Flag
                          title={COUNTRY_KA[row.countryCode] ?? row.country}
                          className="h-10 w-auto rounded object-cover shadow-md ring-1 ring-white/10"
                        />
                      ) : null;
                    })()}
                    <div className="text-white/90 text-[14px] font-semibold whitespace-nowrap">
                      {COUNTRY_KA[row.countryCode] ?? row.country}
                    </div>
                  </div>
                  {hasUserName ? (
                    <>
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="text-white/90 font-semibold shrink-0">{tAddr('name')}</span>
                        <span className="text-white/90 text-right break-all">{userFirstName} </span>
                      </div>
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="text-white/90 font-semibold shrink-0">{tAddr('lastname')}</span>
                        <span className="text-white/90 text-right break-all">{userLastName} </span>
                      </div>
                    </>
                  ) : null}
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-white/90 font-semibold shrink-0">{tAddr('street')}</span>
                    <span className="text-white/90 text-right break-all">{row.adress}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-white/90 font-semibold shrink-0">{tAddr('street2')}</span>
                    <span className="text-white/90 text-right break-words">{userRoomNumber}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-white/90 font-semibold shrink-0">{tAddr('country')}</span>
                    <span className="text-white/90 text-right">{row.country}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-white/90 font-semibold shrink-0">{tAddr('city')}</span>
                    <span className="text-white/90 text-right">{row.city}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-white/90 font-semibold shrink-0">{tAddr('postalCode')}</span>
                    <span className="text-white/90 font-medium">{row.postalCode}</span>
                  </div>
                  {row.phone ? (
                    <div className="flex justify-between gap-2 mt-1">
                      <span className="text-white/90 font-semibold shrink-0">{tAddr('phone')}</span>
                      <span className="text-white/90 font-medium">{row.phone}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
