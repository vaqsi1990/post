import AdminShell from '../components/AdminShell';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { fetchAdminParcelsSsr } from '@/lib/adminParcelSsr';

export const dynamic = 'force-dynamic';

export default async function AdminInTransitPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'В пути', description: 'Управление посылками в пути.', exportExcel: 'Скачать Excel' }
    : locale === 'en'
      ? { title: 'In Transit', description: 'Manage parcels in transit.', exportExcel: 'Download Excel' }
      : { title: 'გზაში', description: 'გზაში მყოფი ამანათების მართვა.', exportExcel: 'Excel ჩამოტვირთვა' };
  const { parcels } = await fetchAdminParcelsSsr('in_transit', sp);

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
        <div className="flex justify-end">
          <Link
            href="/api/admin/parcels/export?status=in_transit"
            className="inline-flex items-center rounded-lg bg-[#3a5bff] px-4 py-2 text-[15px] font-semibold text-white "
          >
            {text.exportExcel}
          </Link>
        </div>
        <ParcelsManager
          initialParcels={formattedParcels}
          currentStatus="in_transit"
          countryHub
        />
      </div>
    </AdminShell>
  );
}

