import AdminShell from '../components/AdminShell';
import prisma from '@/lib/prisma';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export const dynamic = 'force-dynamic';

export default async function AdminStoppedPage() {
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? {
          title: 'Остановленные',
          description: 'Посылки со статусом «остановлено».',
        }
      : locale === 'en'
        ? {
            title: 'Stopped',
            description: 'Parcels with status stopped.',
          }
        : {
            title: 'გაჩერებული',
            description: 'გაჩერებული სტატუსის ამანათები.',
          };

  const parcels = await prisma.parcel.findMany({
    where: { status: 'stopped' },
    orderBy: { createdAt: 'desc' },
    include: adminParcelInclude,
  });

  const formattedParcels = parcels.map((parcel) => ({
    ...parcel,
    createdAt: new Date(parcel.createdAt).toLocaleDateString('ka-GE'),
  }));

  return (
    <AdminShell title={text.title} description={text.description}>
      <ParcelsManager initialParcels={formattedParcels} currentStatus="stopped" />
    </AdminShell>
  );
}
