import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';
import prisma from '../../lib/prisma';
import { resolveTariffForParcel } from '../../lib/tariffLookup';
import { fetchNbgRates } from '../../lib/nbgRates';
import { computeShippingGelBreakdown } from '../../lib/parcelShippingGel';
import DashboardHeader from './components/DashboardHeader';
import UserParcelsTabs, { UserParcel } from './components/UserParcelsTabs';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');
  if (session.user.role === 'EMPLOYEE') redirect('/employee');
  if (session.user.role === 'SUPPORT') redirect('/support');

  const userId = session.user.id;
  const [parcels, tariffs, nbgRates] = await Promise.all([
    prisma.parcel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tariff.findMany({
      where: { isActive: true, destinationCountry: 'GE' },
      select: {
        originCountry: true,
        destinationCountry: true,
        minWeight: true,
        maxWeight: true,
        pricePerKg: true,
        currency: true,
        isActive: true,
      },
    }),
    fetchNbgRates().catch(() => null),
  ]);

  const formattedParcels: UserParcel[] = parcels.map((parcel) => {
    const resolved = resolveTariffForParcel(
      tariffs,
      parcel.originCountry,
      parcel.weight,
    );
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
          <UserParcelsTabs parcels={formattedParcels} />
        </main>
      </div>
    </div>
  );
}
