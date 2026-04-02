import AdminShell from '../components/AdminShell';
import prisma from '../../../lib/prisma';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export default async function AdminStoppedPage() {
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Остановленные', description: 'Управление остановленными посылками.' }
    : locale === 'en'
      ? { title: 'Stopped', description: 'Manage stopped parcels.' }
      : { title: 'გაჩერებული', description: 'გაჩერებული ამანათების მართვა.' };
  const parcels = await prisma.parcel.findMany({
    where: {
      status: 'cancelled',
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
        <ParcelsManager initialParcels={formattedParcels} currentStatus="cancelled" />
      </div>
    </AdminShell>
  );
}

