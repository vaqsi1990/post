import AdminShell from '../components/AdminShell';
import prisma from '../../../lib/prisma';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export default async function AdminWarehousePage() {
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Прибывшие', description: 'Управление прибывшими посылками.' }
    : locale === 'en'
      ? { title: 'Arrived', description: 'Manage arrived parcels.' }
      : { title: 'ჩამოსული', description: 'ჩამოსული ამანათების მართვა.' };
  const parcels = await prisma.parcel.findMany({
    where: {
      status: 'arrived',
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
        <ParcelsManager initialParcels={formattedParcels} currentStatus="arrived" />
      </div>
    </AdminShell>
  );
}

