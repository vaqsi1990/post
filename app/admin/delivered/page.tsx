import AdminShell from '../components/AdminShell';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { fetchAdminParcelsSsr } from '@/lib/adminParcelSsr';

export default async function AdminDeliveredPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Выданные', description: 'Управление выданными посылками.' }
    : locale === 'en'
      ? { title: 'Delivered', description: 'Manage delivered parcels.' }
      : { title: 'გაცემული', description: 'გაცემული ამანათების მართვა.' };
  const { parcels } = await fetchAdminParcelsSsr('delivered', sp);

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
        <ParcelsManager
          initialParcels={formattedParcels}
          currentStatus="delivered"
          countryHub
        />
      </div>
    </AdminShell>
  );
}

