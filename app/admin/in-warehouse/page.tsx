import AdminShell from '../components/AdminShell';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { fetchAdminParcelsSsr } from '@/lib/adminParcelSsr';

export const dynamic = 'force-dynamic';

export default async function AdminInWarehousePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? {
          title: 'На складе',
          description: 'Управление посылками на складе.',
          newParcel: 'Создать новую посылку',
        }
      : locale === 'en'
        ? {
            title: 'In warehouse',
            description: 'Manage parcels in warehouse.',
            newParcel: 'Create new parcel',
          }
        : {
            title: 'საწყობში',
            description: 'საწყობში მყოფი ამანათების მართვა.',
          };

  const { parcels } = await fetchAdminParcelsSsr('in_warehouse', sp);

  const formattedParcels = parcels.map((parcel) => ({
    ...parcel,
    createdAt: new Date(parcel.createdAt).toLocaleDateString('ka-GE'),
  }));

  return (
    <AdminShell title={text.title} description={text.description}>
      <ParcelsManager
        initialParcels={formattedParcels}
        currentStatus="in_warehouse"
        countryHub
      />
    </AdminShell>
  );
}

