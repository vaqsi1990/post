import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { resolveTariffForParcel } from '@/lib/tariffLookup';
import DashboardHeader from '@/app/dashboard/components/DashboardHeader';
import UserParcelsTabs, { UserParcel } from '@/app/dashboard/components/UserParcelsTabs';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const tBalance = await getTranslations('balance');

  if (!session?.user) redirect(`/${locale}/login`);
  if (session.user.role === 'ADMIN') redirect(`/${locale}/admin`);

  const userId = session.user.id;

  const [parcels, user, tariffs] = await Promise.all([
    prisma.parcel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    }),
    prisma.tariff.findMany({
      where: { isActive: true, destinationCountry: 'GE' },
      select: {
        originCountry: true,
        destinationCountry: true,
        minWeight: true,
        maxWeight: true,
        pricePerKg: true,
        isActive: true,
      },
    }),
  ]);

  const balance = user?.balance ?? 0;

  const formattedParcels: UserParcel[] = parcels.map((parcel) => {
    const resolved = resolveTariffForParcel(
      tariffs,
      parcel.originCountry,
      parcel.weight,
    );
    return {
      id: parcel.id,
      trackingNumber: parcel.trackingNumber,
      status: parcel.status,
      price: parcel.price,
      shippingAmount: parcel.shippingAmount ?? null,
      currency: parcel.currency || 'GEL',
      weight: parcel.weight != null ? `${parcel.weight} kg` : '',
      weightKg: parcel.weight ?? null,
      originCountry: parcel.originCountry || null,
      quantity: parcel.quantity,
      customerName: parcel.customerName,
      createdAt: new Date(parcel.createdAt).toLocaleDateString('ka-GE'),
      courierServiceRequested: parcel.courierServiceRequested,
      courierFeeAmount: parcel.courierFeeAmount,
      payableAmount: parcel.payableAmount,
      tariffShippingPayable: resolved?.shippingTotal ?? null,
      tariffPricePerKg: resolved?.pricePerKg ?? null,
    };
  });

  return (
    <div className="  bg min-h-screen py-8">
      <div className="mx-auto mt-24 w-full max-w-7xl px-4">
        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <DashboardHeader />
          <Link
            href="/dashboard/balance"
            className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 sm:px-5 sm:py-4"
          >
            <span className="md:text-[18px] font-medium text-black text-[16px]">
              {tBalance('currentBalance')}
            </span>
            <span className="text-[16px] md:text-[18px] font-semibold text-black">
              {balance.toFixed(2)} <span className="text-base font-medium text-black sm:text-lg">GEL</span>
            </span>
          </Link>
          <UserParcelsTabs parcels={formattedParcels} />
        </main>
      </div>
    </div>
  );
}
