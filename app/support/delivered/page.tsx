import { getLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import SupportShell from '../components/SupportShell';
import ParcelsManager from '@/app/admin/components/ParcelsManager';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export const dynamic = 'force-dynamic';

export default async function SupportDeliveredPage() {
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? { title: 'Выданные', description: 'Управление выданными посылками.' }
      : locale === 'en'
        ? { title: 'Delivered', description: 'Manage delivered parcels.' }
        : { title: 'გაცემული', description: 'გაცემული ამანათების მართვა.' };

  const parcels = await prisma.parcel.findMany({
    where: { status: 'delivered' },
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
          currentStatus="delivered"
          allowDelete={false}
          countryHub
        />
      </div>
    </SupportShell>
  );
}

