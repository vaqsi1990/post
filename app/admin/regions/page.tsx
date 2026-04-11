import AdminShell from '../components/AdminShell';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { fetchAdminParcelsSsr } from '@/lib/adminParcelSsr';

export default async function AdminRegionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Регионы', description: 'Управление посылками в регионах/филиалах.' }
    : locale === 'en'
      ? { title: 'Regions', description: 'Manage parcels in regions/branches.' }
      : { title: 'რეგიონი', description: 'რეგიონებში/ფილიალებში მყოფი ამანათების მართვა.' };
  const { parcels } = await fetchAdminParcelsSsr('region', sp);

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
          currentStatus="region"
        />
      </div>
    </AdminShell>
  );
}

