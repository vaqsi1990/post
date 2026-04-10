import { getLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import SupportShell from '../components/SupportShell';
import ParcelsManager from '@/app/admin/components/ParcelsManager';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export const dynamic = 'force-dynamic';

export default async function SupportStoppedPage() {
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? { title: 'Остановленные', description: 'Посылки со статусом «остановлено».' }
      : locale === 'en'
        ? { title: 'Stopped', description: 'Parcels with status stopped.' }
        : { title: 'გაჩერებული', description: 'გაჩერებული სტატუსის ამანათები.' };

  const parcels = await prisma.parcel.findMany({
    where: { status: 'stopped' },
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
          currentStatus="stopped"
          allowDelete={false}
          countryHub
        />
      </div>
    </SupportShell>
  );
}
