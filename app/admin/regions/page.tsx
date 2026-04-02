import AdminShell from '../components/AdminShell';
import prisma from '../../../lib/prisma';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export default async function AdminRegionsPage() {
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Регионы', description: 'Управление посылками в регионах/филиалах.' }
    : locale === 'en'
      ? { title: 'Regions', description: 'Manage parcels in regions/branches.' }
      : { title: 'რეგიონი', description: 'რეგიონებში/ფილიალებში მყოფი ამანათების მართვა.' };
  const parcels = await prisma.parcel.findMany({
    where: {
      status: 'region',
    },
    orderBy: { createdAt: 'desc' },
    include: adminParcelInclude,
  });

  const formattedParcels = parcels.map((parcel) => ({
    ...parcel,
    createdAt: new Date(parcel.createdAt).toLocaleDateString('ka-GE'),
  }));

  return (
    <AdminShell
      title={text.title}
      description={text.description}
    >
      <div className="space-y-6">
        <ParcelsManager
          initialParcels={formattedParcels}
          currentStatus="region"
        />
      </div>
    </AdminShell>
  );
}

