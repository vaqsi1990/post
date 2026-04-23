import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type React from 'react';
import { getTranslations } from 'next-intl/server';
import CopyableText from './CopyableText';
import { cachedDashboard, dashUserAddressesTag } from '@/lib/cache/dashboardCache';
import {
  GB,
  US,
  CN,
  GR,
  FR,
  TR,
} from 'country-flag-icons/react/3x2';

const FLAGS: Record<string, React.ComponentType<{ title?: string; className?: string }>> = {
  GB,
  US,
  CN,
  GR,
  FR,
  TR,
};

const COUNTRY_KA: Record<string, string> = {
  GB: 'დიდი ბრიტანეთი',
  US: 'ამერიკა',
  CN: 'ჩინეთი',
  GR: 'საბერძნეთი',
  FR: 'საფრანგეთი',
  TR: 'თურქეთი',
};

type AddressRow = {
  countryKey: string;
  countryCode: string;
  cityKey?: string;
  stateKey?: string;
  adress: string;
  fullAddress?: string;
  adress2?: string;
  postalCode: string;
  phone?: string;
};

const ADDRESS_ROWS: AddressRow[] = [
  {
    countryKey: 'fr',
    countryCode: 'FR',
    cityKey: 'paris',
    adress: '7 bis rue decres',
    postalCode: '75014',
    phone: '+33 7 53 19 86 83',
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
    countryKey: 'cn',
    cityKey: 'Guangzhou City / 广州',
    stateKey: 'GuangDong Province / 广东省',
    postalCode: '510407',
    countryCode: 'CN',
    adress: 'BaiYun District/白云区, ',
    fullAddress: '广州市白云区聚源街50/号欣凯科创园C栋102',
    adress2: 'ShiJing Street/石井街道',
    phone: '+86 16602079929',
  },

  {
    countryKey: 'gr',
    countryCode: 'GR',
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

  const userId = session.user.id;
  const user = await cachedDashboard(
    'addresses:userBasics:v1',
    { userId },
    async () => {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, roomNumber: true },
      });
    },
    { ttlSeconds: 3, tags: [dashUserAddressesTag(userId)] },
  );

  const userFirstName = user?.firstName ?? '';
  const userLastName = user?.lastName ?? '';
  const hasUserName = Boolean(userFirstName || userLastName);
  const userRoomNumber = user?.roomNumber ?? '';
  const fullAddressLabel = tAddr.has('fullAddress') ? tAddr('fullAddress') : 'Full address';
  const fullAddressValue = (row: { fullAddress?: string }) => {
    if (!row.fullAddress) return '';
    return userRoomNumber ? `${row.fullAddress}, ${userRoomNumber}` : row.fullAddress;
  };
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
      fullAddress: row.fullAddress,
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
      <h2 className="mb-4 w-full text-center text-lg font-semibold text-neutral-900 sm:mb-6 sm:w-auto sm:text-left sm:text-xl">
        {tAddr('title')}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {addressList.map((row, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
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
                  <CopyableText
                    text={userFirstName}
                    ariaLabel="Copy first name"
                    className="break-all text-right text-neutral-800"
                  >
                    {userFirstName}{' '}
                  </CopyableText>
                </div>
                <div className="mb-1 flex justify-between gap-2">
                  <span className="shrink-0 font-semibold text-neutral-800">{tAddr('lastname')}</span>
                  <CopyableText
                    text={userLastName}
                    ariaLabel="Copy last name"
                    className="break-all text-right text-neutral-800"
                  >
                    {userLastName}{' '}
                  </CopyableText>
                </div>
              </>
            ) : null}
            {row.fullAddress ? (
              <div className="mb-2 flex justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">{fullAddressLabel}</span>
                <CopyableText
                  text={fullAddressValue(row)}
                  ariaLabel="Copy full address"
                  className="break-all text-right text-neutral-800"
                >
                  {fullAddressValue(row)}
                </CopyableText>
              </div>
            ) : null}
            <div className="mb-2 flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('street')}</span>
              <CopyableText text={row.adress} ariaLabel="Copy street" className="break-all text-right text-neutral-800">
                {row.adress}
              </CopyableText>
            </div>
            <div className="mb-2 flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('street2')}</span>
              <CopyableText
                text={street2Value(row)}
                ariaLabel="Copy street 2"
                className="break-words text-right text-neutral-800"
              >
                {street2Value(row)}
              </CopyableText>
            </div>
            <div className="mb-2 flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('country')}</span>
              <CopyableText text={row.country} ariaLabel="Copy country" className="text-right text-neutral-800">
                {row.country}
              </CopyableText>
            </div>
            <div className="mb-2 flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('city')}</span>
              <CopyableText text={row.city} ariaLabel="Copy city" className="text-right text-neutral-800">
                {row.city}
              </CopyableText>
            </div>

            {row.state ? (
              <div className="mb-2 flex justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">
                  {row.countryCode === 'CN' ? tAddr('province') : tAddr('state')}
                </span>
                <CopyableText text={row.state} ariaLabel="Copy state" className="text-right text-neutral-800">
                  {row.state}
                </CopyableText>
              </div>
            ) : null}

            <div className="flex justify-between gap-2">
              <span className="shrink-0 font-semibold text-neutral-800">{tAddr('postalCode')}</span>
              <CopyableText
                text={row.postalCode}
                ariaLabel="Copy postal code"
                className="font-medium text-neutral-800"
              >
                {row.postalCode}
              </CopyableText>
            </div>
            {row.phone ? (
              <div className="mt-1 flex justify-between gap-2">
                <span className="shrink-0 font-semibold text-neutral-800">{tAddr('phone')}</span>
                <CopyableText text={row.phone} ariaLabel="Copy phone" className="font-medium text-neutral-800">
                  {row.phone}
                </CopyableText>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
