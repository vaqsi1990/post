import AdminShell from '../components/AdminShell';
import prisma from '../../../lib/prisma';
import ParcelsManager from '../components/ParcelsManager';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminIncomingPage() {
  const parcels = await prisma.parcel.findMany({
    where: {
      status: 'pending',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          city: true,
          address: true,
        },
      },
    },
  });

  const formattedParcels = parcels.map((parcel) => ({
    ...parcel,
    createdAt: new Date(parcel.createdAt).toLocaleDateString('ka-GE'),
  }));

  return (
    <AdminShell
      title="შემოსული"
      description="შემოსული მომხმარებლის ამანათების მართვა."
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link
            href="/admin/incoming/new"
            className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-[15px] font-semibold text-white hover:bg-gray-900"
          >
            ახალი ამანათის შექმნა
          </Link>
        </div>
        <ParcelsManager initialParcels={formattedParcels} currentStatus="pending" />
      </div>
    </AdminShell>
  );
}

