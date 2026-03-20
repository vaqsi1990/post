import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type React from 'react';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
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


export const dynamic = 'force-dynamic';

export default async function DashboardAddressesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  const initialAddresses = addresses.map((a) => ({
    id: a.id,
    type: a.type,
    country: a.country,
    city: a.city,
    street: a.street,
    building: a.building,
    apartment: a.apartment,
    postalCode: a.postalCode,
    isDefault: a.isDefault,
    createdAt: new Date(a.createdAt).toISOString(),
  }));

  const addressList = [
    { country: 'დიდი ბრიტანეთი', countryCode: 'GB', city: '', street: '', postalCode: '' },
    { country: 'იტალია', countryCode: 'IT', city: 'Paris', street: '7 bis rue decres, Paris, France', postalCode: '75014', phone: '+33 7 53 19 86 83' },
    { country: 'საბერძნეთი', countryCode: 'GR', city: '', street: '', postalCode: '' },
    { country: 'ესპანეთი', countryCode: 'ES', city: 'Paris', street: '7 bis rue decres, Paris, France', postalCode: '75014', phone: '+33 7 53 19 86 83' },
    { country: 'საფრანგეთი', countryCode: 'FR', city: 'Paris', street: '7 bis rue decres, Paris, France', postalCode: '75014', phone: '+33 7 53 19 86 83' },
    { country: 'გერმანია', countryCode: 'DE', city: 'Paris', street: '7 bis rue decres, Paris, France', postalCode: '75014', phone: '+33 7 53 19 86 83' },
    { country: 'თურქეთი', countryCode: 'TR', city: '', street: '', postalCode: '' },
  ];

  return (
    <div className="bg-[#010002] py-4 sm:py-8 text-white">
      <div className="mx-auto mt-16 sm:mt-20 md:mt-24 w-full max-w-3xl px-3 sm:px-4">
        <main className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#121311] p-4 sm:p-6">
          <div className="pb-4 sm:pb-6 border-b border-white/10">
            <Link href="/dashboard" className="text-[16px] md:text-[18px] font-medium text-white hover:text-white/90">
              ← უკან დაბრუნება
            </Link>
          </div>
          <div className="pt-4 sm:pt-6">
            <h1 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">მისამართები</h1>

            {/* Mobile: card list */}
            <div className="md:hidden space-y-3">
              {addressList.map((row, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="flex flex-col items-center gap-1 mb-2">
                    {(() => {
                      const Flag = FLAGS[row.countryCode];
                      return Flag ? (
                        <Flag
                          title={row.country}
                          className="h-8 w-auto rounded object-cover shadow-md ring-1 ring-white/10"
                        />
                      ) : null;
                    })()}
                    <div className="text-white/90 text-[14px] font-semibold">{row.country}</div>
                  </div>
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-[#3A5BFF] font-semibold shrink-0">ქალაქი</span>
                    <span className="text-white/90 text-right">{row.city}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-[#3A5BFF] font-semibold shrink-0">ქუჩა </span>
                    <span className="text-white/90 text-right break-all">{row.street}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#3A5BFF] font-semibold shrink-0">ინდექსი</span>
                    <span className="text-white/90 font-medium">{row.postalCode}</span>
                  </div>
                  {row.phone ? (
                    <div className="flex justify-between gap-2 mt-1">
                      <span className="text-[#3A5BFF] font-semibold shrink-0">ტელეფონი</span>
                      <span className="text-white/90 font-medium">{row.phone}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Desktop: show each country as its own card */}
            <div className="hidden md:grid md:grid-cols-3 gap-4">
              {addressList.map((row, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col items-center gap-1 mb-3">
                    {(() => {
                      const Flag = FLAGS[row.countryCode];
                      return Flag ? (
                        <Flag
                          title={row.country}
                          className="h-10 w-auto rounded object-cover shadow-md ring-1 ring-white/10"
                        />
                      ) : null;
                    })()}
                    <div className="text-white/90 text-[14px] font-semibold">{row.country}</div>
                  </div>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-[#3A5BFF] font-semibold shrink-0">ქალაქი</span>
                    <span className="text-white/90 text-right">{row.city}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-[#3A5BFF] font-semibold shrink-0">ქუჩა </span>
                    <span className="text-white/90 text-right break-all">{row.street}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#3A5BFF] font-semibold shrink-0">ინდექსი</span>
                    <span className="text-white/90 font-medium">{row.postalCode}</span>
                  </div>
                  {row.phone ? (
                    <div className="flex justify-between gap-2 mt-1">
                      <span className="text-[#3A5BFF] font-semibold shrink-0">ტელეფონი</span>
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
