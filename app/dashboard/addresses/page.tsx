import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';


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
    { country: 'დიდი ბრიტანეთი', city: 'ლონდონი', street: 'Baker Street 221B, 3', postalCode: 'NW1 6XE' },
    { country: 'ამერიკა', city: 'ნიუ-იორკი', street: 'Fifth Avenue 350, 12', postalCode: '10118' },
    { country: 'ჩინეთი', city: 'პეკინი', street: 'Wangfujing Street 88, 5', postalCode: '100006' },
    { country: 'იტალია', city: 'რომი', street: 'Via Condotti 15, 2', postalCode: '00187' },
    { country: 'საბერძნეთი', city: 'ათენი', street: 'Ermou 45, 1', postalCode: '10563' },
    { country: 'ესპანეთი', city: 'მადრიდი', street: 'Gran Vía 28, 4', postalCode: '28013' },
    { country: 'საფრანგეთი', city: 'პარიზი', street: 'Champs-Élysées 101, A', postalCode: '75008' },
    { country: 'გერმანია', city: 'ბერლინი', street: 'Unter den Linden 77, 6', postalCode: '10117' },
    { country: 'თურქეთი', city: 'ისტანბული', street: 'İstiklal Caddesi 120, 7', postalCode: '34433' },
    { country: 'საქართველო', city: 'თბილისი', street: 'ვაჟა-ფშაველას 12, 5', postalCode: '0162' },
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-4 sm:py-8">
      <div className="mx-auto mt-16 sm:mt-20 md:mt-24 w-full max-w-3xl px-3 sm:px-4">
        <main className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="pb-4 sm:pb-6 border-b border-gray-200">
            <Link href="/dashboard" className="text-[15px] font-medium text-gray-600 hover:text-black">
              ← უკან დაბრუნება
            </Link>
          </div>
          <div className="pt-4 sm:pt-6">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">მისამართები</h1>

            {/* Mobile: card list */}
            <div className="md:hidden space-y-3">
              {addressList.map((row, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 text-sm">
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-gray-500 shrink-0">ქვეყანა</span>
                    <span className="text-gray-900 text-right">{row.country}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-gray-500 shrink-0">ქალაქი</span>
                    <span className="text-gray-900 text-right">{row.city}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-gray-500 shrink-0">ქუჩა </span>
                    <span className="text-gray-900 text-right break-all">{row.street}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 shrink-0">ინდექსი</span>
                    <span className="text-gray-900 font-medium">{row.postalCode}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ქვეყანა</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ქალაქი</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ქუჩა / შენობა</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ინდექსი</th>
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
