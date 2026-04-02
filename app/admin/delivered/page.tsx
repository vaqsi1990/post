import AdminShell from '../components/AdminShell';
import prisma from '../../../lib/prisma';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export default async function AdminDeliveredPage() {
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Выданные', description: 'Управление выданными посылками.' }
    : locale === 'en'
      ? { title: 'Delivered', description: 'Manage delivered parcels.' }
      : { title: 'გაცემული', description: 'გაცემული ამანათების მართვა.' };
  const parcels = await prisma.parcel.findMany({
    where: {
      status: 'delivered',
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
        <ParcelsManager initialParcels={formattedParcels} currentStatus="delivered" />
      </div>
    </AdminShell>
  );
}

