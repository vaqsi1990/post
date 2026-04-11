import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';
import prisma from '../../lib/prisma';
import { getCachedActiveTariffsForGeorgia } from '@/lib/cachedTariffs';
import {
  DASHBOARD_PARCEL_PAGE_SIZE,
  parseDashboardParcelPage,
  parseDashboardParcelTab,
} from '@/lib/dashboardParcelList';
import { fetchNbgRates } from '../../lib/nbgRates';
import { computeShippingGelBreakdown } from '../../lib/parcelShippingGel';
import DashboardHeader from './components/DashboardHeader';
import UserParcelsTabs, { UserParcel } from './components/UserParcelsTabs';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const parcelTab = parseDashboardParcelTab(sp.status);
  const pageRequested = parseDashboardParcelPage(sp.page);
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');
  if (session.user.role === 'EMPLOYEE') redirect('/employee');
  if (session.user.role === 'SUPPORT') redirect('/support');

  const userId = session.user.id;

  const [statusGroups, totalForTab, tariffs, nbgRates] = await Promise.all([
    prisma.parcel.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.parcel.count({
      where: { userId, status: parcelTab },
    }),
    getCachedActiveTariffsForGeorgia(),
    fetchNbgRates().catch(() => null),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalForTab / DASHBOARD_PARCEL_PAGE_SIZE),
  );
  const page = Math.min(pageRequested, totalPages);

  const parcels = await prisma.parcel.findMany({
    where: { userId, status: parcelTab },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * DASHBOARD_PARCEL_PAGE_SIZE,
    take: DASHBOARD_PARCEL_PAGE_SIZE,
  });

  const statusCounts: Partial<Record<string, number>> = {};
  for (const row of statusGroups) {
    statusCounts[row.status] = row._count._all;
  }

  const formattedParcels: UserParcel[] = parcels.map((parcel) => {
    const breakdown = computeShippingGelBreakdown(
      { originCountry: parcel.originCountry, weight: parcel.weight },
      tariffs,
      nbgRates,
    );
    return {
      id: parcel.id,
      trackingNumber: parcel.trackingNumber,
      status: parcel.status,
      price: parcel.price,
      onlineShop: parcel.onlineShop ?? null,
      description: parcel.description ?? null,
      comment: parcel.comment ?? null,
      shippingAmount:
        breakdown?.amountGel ?? parcel.shippingAmount ?? null,
      currency: 'GEL',
      shippingFormula: breakdown?.formula ?? null,
      weight: parcel.weight != null ? `${parcel.weight} kg` : '',
      weightKg: parcel.weight ?? null,
      originCountry: parcel.originCountry || null,
      quantity: parcel.quantity,
      customerName: parcel.customerName,
      createdAt: new Date(parcel.createdAt).toLocaleDateString('ka-GE'),
      courierServiceRequested: parcel.courierServiceRequested,
      courierFeeAmount: parcel.courierFeeAmount,
      payableAmount: parcel.payableAmount,
      tariffShippingPayable: breakdown?.amountGel ?? null,
      tariffPricePerKg: breakdown?.pricePerKgGel ?? null,
    };
  });

  return (
    <div className=" bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-7xl px-4">
        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <DashboardHeader />
          <UserParcelsTabs
            parcels={formattedParcels}
            statusCounts={statusCounts}
            selectedStatus={parcelTab}
            page={page}
            totalPages={totalPages}
            dashboardBasePath="/dashboard"
          />
        </main>
      </div>
    </div>
  );
}
