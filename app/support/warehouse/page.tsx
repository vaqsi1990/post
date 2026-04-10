import { getLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import SupportShell from '../components/SupportShell';
import ParcelsManager from '@/app/admin/components/ParcelsManager';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export const dynamic = 'force-dynamic';

export default async function SupportWarehousePage() {
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? { title: 'Прибывшие', description: 'Управление прибывшими посылками.' }
      : locale === 'en'
        ? { title: 'Arrived', description: 'Manage arrived parcels.' }
        : { title: 'ჩამოსული', description: 'ჩამოსული ამანათების მართვა.' };

  const parcels = await prisma.parcel.findMany({
    where: { status: 'arrived' },
    orderBy: [{ originCountry: 'asc' }, { createdAt: 'desc' }],
    include: adminParcelInclude,
  });

  const formattedParcels = parcels.map((parcel) => ({
    ...parcel,
    createdAt: new Date(parcel.createdAt).toLocaleDateString('ka-GE'),
  }));

  return (
    <SupportShell title={text.title} description={text.description}>
      <div className="space-y-6">
        <ParcelsManager
          initialParcels={formattedParcels}
          currentStatus="arrived"
          allowDelete={false}
          countryHub
        />
      </div>
    </SupportShell>
  );
}

