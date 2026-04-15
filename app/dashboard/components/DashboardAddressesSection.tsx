import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type React from 'react';
import { getTranslations } from 'next-intl/server';
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

const COUNTRY_KA: Record<string, string> = {
  GB: 'დიდი ბრიტანეთი',
  US: 'ამერიკა',
  CN: 'ჩინეთი',
  IT: 'იტალია',
  GR: 'საბერძნეთი',
  ES: 'ესპანეთი',
  FR: 'საფრანგეთი',
  DE: 'გერმანია',
  TR: 'თურქეთი',
};

type AddressRow = {
  countryKey: string;
  countryCode: string;
  cityKey?: string;
  stateKey?: string;
  adress: string;
  adress2?: string;
  postalCode: string;
  phone?: string;
};

const ADDRESS_ROWS: AddressRow[] = [
  {
    countryKey: 'uk',
    countryCode: 'GB',
    adress: '13 Oglethorpe Road',
    cityKey: 'Dagenham',
    stateKey: 'Essex',
    postalCode: 'RM10 7SA ',
    phone: '+44 7386 585212',
  },
  {
    countryKey: 'us',
    phone: '+1 (934) 777-5589',
    countryCode: 'US',
    adress: '22 Parkway Circle',
    adress2: 'Unit 5',
    stateKey: 'DELAWARE (DE)',
    cityKey: 'New Castle',
    postalCode: '19720',
  },
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
    countryKey: 'gr',
    countryCode: 'GR',
    cityKey: 'paris',
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

export default async function DashboardAddressesSection() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const tAddr = await getTranslations('addresses');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, roomNumber: true },
  });

  const userFirstName = user?.firstName ?? '';
  const userLastName = user?.lastName ?? '';
  const hasUserName = Boolean(userFirstName || userLastName);
  const userRoomNumber = user?.roomNumber ?? '';
  const street2Value = (row: { adress2?: string }) => {
    if (!row.adress2) return userRoomNumber;
    return userRoomNumber ? `${row.adress2}, ${userRoomNumber}` : row.adress2;
  };

  const addressList = ADDRESS_ROWS.map((row) => {
    const country = tAddr.has(row.countryKey)
      ? tAddr(row.countryKey)
      : row.countryKey;

    const city =
      row.cityKey && tAddr.has(row.cityKey) ? tAddr(row.cityKey) : (row.cityKey ?? '');

    const state =
      row.stateKey && tAddr.has(row.stateKey) ? tAddr(row.stateKey) : (row.stateKey ?? '');

    return {
      countryCode: row.countryCode,
      country,
      city,
      state,
      adress: row.adress,
      adress2: row.adress2,
      postalCode: row.postalCode,
      phone: row.phone,
    };
  });

  return (
    <section
      id="dashboard-addresses"
      className="mt-8 scroll-mt-28 border-t border-gray-200 pt-8 text-neutral-900"
    >
     
      <h2 className="mb-4 text-lg font-semibold text-neutral-900 sm:mb-6 sm:text-xl">{tAddr('title')}</h2>

      <div className="space-y-3 md:hidden">
        {addressList.map((row, i) => (
          <div key={i}>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Flag = FLAGS[row.countryCode];
                    return Flag ? (
                      <Flag
                        title={row.country}
                        className="h-8 w-auto rounded object-cover shadow-md ring-1 ring-black/10"
                      />
                    ) : null;
                  })()}
                  <span className="whitespace-nowrap text-[15px] font-semibold text-[#3a5bff]">
                    {COUNTRY_KA[row.countryCode] ?? row.country}
                  </span>
                </div>
              </div>
              {hasUserName ? (
                <>
                  <div className="mb-1 flex justify-between gap-2">
                    <span className="shrink-0 font-semibold text-neutral-800">{tAddr('name')}</span>
                    <span className="break-all text-right text-neutral-800">{userFirstName} </span>
                  </div>
                  <div className="mb-1 flex justify-between gap-2">
                    <span className="shrink-0 font-semibold text-neutral-800">{tAddr('lastname')}</span>
                    <span className="break-all text-right text-neutral-800">{userLastName} </span>
                  </div>
                </>
              ) : null}
              <div className="mb-1 flex justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">{tAddr('street')}</span>
                <span className="break-all text-right text-neutral-800">{row.adress}</span>
              </div>
              <div className="mb-1 flex justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">{tAddr('street2')}</span>
                <span className="break-words text-right text-neutral-800">{street2Value(row)}</span>
              </div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">{tAddr('country')}</span>

                <span className="text-[14px] font-semibold text-neutral-800">{row.country}</span>
              </div>
              <div className="mb-1 flex justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">{tAddr('city')}</span>
                <span className="text-right text-neutral-800">{row.city}</span>
              </div>

              {row.state ? (
                <div className="mb-1 flex justify-between gap-2">
                  <span className="shrink-0 font-semibold text-neutral-800">{tAddr('state')}</span>
                  <span className="text-right text-neutral-800">{row.state}</span>
                </div>
              ) : null}

              <div className="flex justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">{tAddr('postalCode')}</span>
                <span className="font-medium text-neutral-800">{row.postalCode}</span>
              </div>
              {row.phone ? (
                <div className="mt-1 flex justify-between gap-2">
                  <span className="shrink-0 font-semibold text-neutral-800">{tAddr('phone')}</span>
                  <span className="font-medium text-neutral-800">{row.phone}</span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden gap-4  md:grid md:grid-cols-3">
        {addressList.map((row, i) => (
          <div key={i} className="rounded-lg  border border-black bg-neutral-50 p-4">
            <div className="mb-3 flex items-center justify-center gap-3">
              {(() => {
                const Flag = FLAGS[row.countryCode];
                return Flag ? (
                  <Flag
                    title={COUNTRY_KA[row.countryCode] ?? row.country}
                    className="h-10 w-auto rounded object-cover shadow-md ring-1 ring-black/10"
                  />
                ) : null;
              })()}
              <div className="whitespace-nowrap text-[15px] font-semibold text-[#3a5bff]">
                {COUNTRY_KA[row.countryCode] ?? row.country}
              </div>
            </div>
            {hasUserName ? (
              <>
                <div className="mb-1 flex justify-between gap-2">
                  <span className="shrink-0 font-semibold text-neutral-800">{tAddr('name')}</span>
                  <span className="break-all text-right text-neutral-800">{userFirstName} </span>
                </div>
                <div className="mb-1 flex justify-between gap-2">
                  <span className="shrink-0 font-semibold text-neutral-800">{tAddr('lastname')}</span>
                  <span className="break-all text-right text-neutral-800">{userLastName} </span>
                </div>
              </>
            ) : null}
            <div className="mb-2 flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('street')}</span>
              <span className="break-all text-right text-neutral-800">{row.adress}</span>
            </div>
            <div className="mb-2 flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('street2')}</span>
              <span className="break-words text-right text-neutral-800">{street2Value(row)}</span>
            </div>
            <div className="mb-2 flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('country')}</span>
              <span className="text-right text-neutral-800">{row.country}</span>
            </div>
            <div className="mb-2 flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('city')}</span>
              <span className="text-right text-neutral-800">{row.city}</span>
            </div>

            {row.state ? (
              <div className="mb-2 flex justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">{tAddr('state')}</span>
                <span className="text-right text-neutral-800">{row.state}</span>
              </div>
            ) : null}

            <div className="flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('postalCode')}</span>
              <span className="font-medium text-neutral-800">{row.postalCode}</span>
            </div>
            {row.phone ? (
              <div className="mt-1 flex justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">{tAddr('phone')}</span>
                <span className="font-medium text-neutral-800">{row.phone}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
