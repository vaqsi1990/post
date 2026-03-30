import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  buildDashboardTariffRows,
  formKeyForTariffIso,
  resolveTariffForParcel,
} from '@/lib/tariffLookup';
import DashboardAddressesSection from '@/app/dashboard/components/DashboardAddressesSection';
import DashboardTariffsSection from '@/app/dashboard/components/DashboardTariffsSection';
import UserParcelsTabs, { UserParcel } from '@/app/dashboard/components/UserParcelsTabs';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const tDashboard = await getTranslations('dashboard');
  const tParcels = await getTranslations('parcels');
  const tBalance = await getTranslations('balance');

  if (!session?.user) redirect(`/${locale}/login`);
  if (session.user.role === 'ADMIN') redirect(`/${locale}/admin`);

  const userId = session.user.id;

  const [parcels, tariffs, user] = await Promise.all([
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
    prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    }),
  ]);

  const intlLocale =
    locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US';

  const balanceGel = user?.balance ?? 0;
  const balanceFormatted = new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'GEL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balanceGel);

  const dashboardTariffRows = buildDashboardTariffRows(tariffs).map((row) => {
    const fk = formKeyForTariffIso(row.originIso);
    const label = fk
      ? tParcels(`originCountryLabels.${fk}`)
      : row.originIso;
    const priceFormatted = new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: row.currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(row.pricePerKg);
    return {
      key: row.originIso,
      label,
      priceFormatted,
    };
  });

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
    <div className="  bg ">
      <div className="mx-auto mt-24 w-full max-w-7xl px-4">
        <main className="w-full min-w-0 rounded-2xl bg-white p-6">
          <div className="mb-6 flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
            <aside className="flex md:w-[300px] md:h-[200px] w-full shrink-0 flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 lg:max-w-[16rem]">
              <div>
                <p className="text-[16px] font-semibold uppercase tracking-wide text-slate-500">
                  {tBalance('currentBalance')}
                </p>
                <p className="mt-2 md:text-[20px] text-[18px] font-bold tabular-nums text-slate-900">
                  {balanceFormatted}
                </p>
              </div>
              <Link
                href="/dashboard/balance"
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#3a5bff] px-4 py-3 text-center text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#2d4ae0]"
              >
                {tDashboard('balanceTopUp')}
              </Link>
            </aside>
            <div className="min-w-0 flex-1">
              <DashboardTariffsSection
                title={tDashboard('tariffBannerTitle')}
                perKgLabel={tDashboard('tariffPerKgLabel')}
                rows={dashboardTariffRows}
              />
            </div>
          </div>
          <DashboardAddressesSection />
          <UserParcelsTabs parcels={formattedParcels} />
        </main>
      </div>
    </div>
  );
}
