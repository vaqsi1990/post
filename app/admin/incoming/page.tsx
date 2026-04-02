import AdminShell from '../components/AdminShell';
import prisma from '../../../lib/prisma';
import ParcelsManager from '../components/ParcelsManager';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { adminParcelInclude } from '@/lib/adminParcelInclude';

export const dynamic = 'force-dynamic';

export default async function AdminIncomingPage() {
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Поступившие', description: 'Управление поступившими посылками.', newParcel: 'Создать новую посылку' }
    : locale === 'en'
      ? { title: 'Incoming', description: 'Manage incoming parcels.', newParcel: 'Create new parcel' }
      : { title: 'შემოსული', description: 'შემოსული  ამანათების მართვა.', newParcel: 'ახალი ამანათის შექმნა' };
  const parcels = await prisma.parcel.findMany({
    where: {
      status: 'pending',
    },
    orderBy: { createdAt: 'desc' },
    include: adminParcelInclude,
  });

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
            href="/admin/incoming/new"
            className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-[15px] font-semibold text-white hover:bg-gray-900"
          >
            {text.newParcel}
          </Link>
        </div>
        <ParcelsManager initialParcels={formattedParcels} currentStatus="pending" />
      </div>
    </AdminShell>
  );
}

