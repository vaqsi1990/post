import { getLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import SupportShell from '../components/SupportShell';
import ParcelsManager from '@/app/admin/components/ParcelsManager';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export const dynamic = 'force-dynamic';

export default async function SupportInTransitPage() {
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? { title: 'В пути', description: 'Управление посылками в пути.' }
      : locale === 'en'
        ? { title: 'In Transit', description: 'Manage parcels in transit.' }
        : { title: 'გზაში', description: 'გზაში მყოფი ამანათების მართვა.' };

  const parcels = await prisma.parcel.findMany({
    where: { status: 'in_transit' },
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
          currentStatus="in_transit"
          allowDelete={false}
          countryHub
        />
      </div>
    </SupportShell>
  );
}

