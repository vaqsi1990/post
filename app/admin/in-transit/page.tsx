import AdminShell from '../components/AdminShell';
import prisma from '../../../lib/prisma';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export const dynamic = 'force-dynamic';

export default async function AdminInTransitPage() {
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'В пути', description: 'Управление посылками в пути.' }
    : locale === 'en'
      ? { title: 'In Transit', description: 'Manage parcels in transit.' }
      : { title: 'გზაში', description: 'გზაში მყოფი ამანათების მართვა.' };
  const parcels = await prisma.parcel.findMany({
    where: {
      status: 'in_transit',
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
        <ParcelsManager initialParcels={formattedParcels} currentStatus="in_transit" />
      </div>
    </AdminShell>
  );
}

