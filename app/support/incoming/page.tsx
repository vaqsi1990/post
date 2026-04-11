import { getLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import SupportShell from '../components/SupportShell';
import ParcelsManager from '@/app/admin/components/ParcelsManager';
import { adminParcelInclude } from '@/lib/adminParcelInclude';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SupportIncomingPage() {
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? {
          title: 'Поступившие',
          description: 'Управление поступившими посылками.',
          newParcel: 'Создать новую посылку',
        }
      : locale === 'en'
        ? { title: 'Incoming', description: 'Manage incoming parcels.', newParcel: 'Create new parcel' }
        : {
            title: 'მოლოდინში',
            description: 'მოლოდინში ამანათების მართვა.',
            newParcel: 'ამანათის დამატება',
          };

  const parcels = await prisma.parcel.findMany({
    where: { status: 'pending' },
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
        <div className="flex justify-end">
          <Link
            href="/support/incoming/new"
            className="inline-flex items-center rounded-lg bg-[#3a5bff] px-4 py-2 text-[15px] font-semibold text-white "
          >
            {text.newParcel}
          </Link>
        </div>
        <ParcelsManager
          initialParcels={formattedParcels}
          currentStatus="pending"
          allowDelete={false}
          countryHub
        />
      </div>
    </SupportShell>
  );
}

