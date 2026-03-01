import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

const ADDRESS_ROWS = [
  { countryKey: 'uk' as const, cityKey: 'london' as const, street: 'Baker Street 221B, 3', postalCode: 'NW1 6XE' },
  { countryKey: 'us' as const, cityKey: 'newYork' as const, street: 'Fifth Avenue 350, 12', postalCode: '10118' },
  { countryKey: 'cn' as const, cityKey: 'beijing' as const, street: 'Wangfujing Street 88, 5', postalCode: '100006' },
  { countryKey: 'it' as const, cityKey: 'rome' as const, street: 'Via Condotti 15, 2', postalCode: '00187' },
  { countryKey: 'gr' as const, cityKey: 'athens' as const, street: 'Ermou 45, 1', postalCode: '10563' },
  { countryKey: 'es' as const, cityKey: 'madrid' as const, street: 'Gran Vía 28, 4', postalCode: '28013' },
  { countryKey: 'fr' as const, cityKey: 'paris' as const, street: 'Champs-Élysées 101, A', postalCode: '75008' },
  { countryKey: 'de' as const, cityKey: 'berlin' as const, street: 'Unter den Linden 77, 6', postalCode: '10117' },
  { countryKey: 'tr' as const, cityKey: 'istanbul' as const, street: 'İstiklal Caddesi 120, 7', postalCode: '34433' },
  { countryKey: 'ge' as const, cityKey: 'tbilisi' as const, street: 'Vazha-Pshavela 12, 5', postalCode: '0162' },
];

export default async function DashboardAddressesPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations('common');
  const tAddr = await getTranslations('addresses');

  if (!session?.user) redirect(`/${locale}/login`);
  if (session.user.role === 'ADMIN') redirect(`/${locale}/admin`);

  await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  const addressList = ADDRESS_ROWS.map((row) => ({
    country: tAddr(row.countryKey),
    city: tAddr(row.cityKey),
    street: row.street,
    postalCode: row.postalCode,
  }));

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-4 sm:py-8">
      <div className="mx-auto mt-16 sm:mt-20 md:mt-24 w-full max-w-3xl px-3 sm:px-4">
        <main className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="pb-4 sm:pb-6 border-b border-gray-200">
            <Link href="/dashboard" className="text-[15px] font-medium text-gray-600 hover:text-black">
              ← {t('back')}
            </Link>
          </div>
          <div className="pt-4 sm:pt-6">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">{tAddr('title')}</h1>

            <div className="md:hidden space-y-3">
              {addressList.map((row, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 text-sm">
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-gray-500 shrink-0">{tAddr('country')}</span>
                    <span className="text-gray-900 text-right">{row.country}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-gray-500 shrink-0">{tAddr('city')}</span>
                    <span className="text-gray-900 text-right">{row.city}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-gray-500 shrink-0">{tAddr('street')}</span>
                    <span className="text-gray-900 text-right break-all">{row.street}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 shrink-0">{tAddr('postalCode')}</span>
                    <span className="text-gray-900 font-medium">{row.postalCode}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{tAddr('country')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{tAddr('city')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{tAddr('streetBuilding')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{tAddr('postalCode')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {addressList.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{row.country}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{row.city}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.street}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{row.postalCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
