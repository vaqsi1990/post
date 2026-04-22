import AdminShell from '../components/AdminShell';
import ParcelsManager, { type Parcel } from '../components/ParcelsManager';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { fetchAdminParcelsSsr } from '@/lib/adminParcelSsr';

export const dynamic = 'force-dynamic';

export default async function AdminIncomingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Поступившие', description: 'Управление поступившими посылками.', newParcel: 'Создать новую посылку' }
    : locale === 'en'
      ? { title: 'Incoming', description: 'Manage incoming parcels.', newParcel: 'Create new parcel' }
      : { title: 'მოლოდინში', description: 'მოლოდინში ამანათების მართვა.', newParcel: 'ამანათის დამატება' };
  const { parcels } = await fetchAdminParcelsSsr('pending', sp);

  return (
    <AdminShell
      title={text.title}
      description={text.description}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link
            href="/admin/incoming/new"
            className="inline-flex items-center rounded-lg bg-[#3a5bff] px-4 py-2 text-[16px] font-semibold text-white "
          >
            {text.newParcel}
          </Link>
        </div>
        <ParcelsManager
          initialParcels={parcels as unknown as Parcel[]}
          currentStatus="pending"
          countryHub
        />
      </div>
    </AdminShell>
  );
}

