import AdminShell from '../components/AdminShell';
import prisma from '../../../lib/prisma';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { adminParcelInclude } from '@/lib/adminParcelInclude';
import { fetchNbgRates } from '@/lib/nbgRates';
import { computeShippingGelBreakdown } from '@/lib/parcelShippingGel';
import type { TariffPick } from '@/lib/tariffLookup';

export default async function AdminWarehousePage() {
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Прибывшие', description: 'Управление прибывшими посылками.' }
    : locale === 'en'
      ? { title: 'Arrived', description: 'Manage arrived parcels.' }
      : { title: 'ჩამოსული', description: 'ჩამოსული ამანათების მართვა.' };
  const [parcels, tariffs, nbgRates] = await Promise.all([
    prisma.parcel.findMany({
      where: {
        status: 'arrived',
      },
      orderBy: { createdAt: 'desc' },
      include: adminParcelInclude,
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
    }) as Promise<TariffPick[]>,
    fetchNbgRates().catch(() => null),
  ]);

  const formattedParcels = parcels.map((parcel) => {
    const breakdown = computeShippingGelBreakdown(
      { originCountry: parcel.originCountry, weight: parcel.weight },
      tariffs,
      nbgRates,
    );
    return {
      ...parcel,
      createdAt: new Date(parcel.createdAt).toLocaleDateString('ka-GE'),
      shippingAmount:
        breakdown != null ? breakdown.amountGel : parcel.shippingAmount,
      shippingFormula:
        breakdown != null ? breakdown.formula : null,
    };
  });

  return (
    <AdminShell
      title={text.title}
      description={text.description}
    >
      <div className="space-y-6">
        <ParcelsManager initialParcels={formattedParcels} currentStatus="arrived" />
      </div>
    </AdminShell>
  );
}

