import AdminShell from '../components/AdminShell';
import { getCachedActiveTariffsForGeorgia } from '@/lib/cachedTariffs';
import ParcelsManager from '../components/ParcelsManager';
import { getLocale } from 'next-intl/server';
import { fetchNbgRates } from '@/lib/nbgRates';
import { computeShippingGelBreakdown } from '@/lib/parcelShippingGel';
import { fetchAdminParcelsSsr } from '@/lib/adminParcelSsr';

export default async function AdminWarehousePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const text = locale === 'ru'
    ? { title: 'Прибывшие', description: 'Управление прибывшими посылками.' }
    : locale === 'en'
      ? { title: 'Arrived', description: 'Manage arrived parcels.' }
      : { title: 'ჩამოსული', description: 'ჩამოსული ამანათების მართვა.' };
  const [{ parcels }, tariffs, nbgRates] = await Promise.all([
    fetchAdminParcelsSsr('arrived', sp),
    getCachedActiveTariffsForGeorgia(),
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
        <ParcelsManager
          initialParcels={formattedParcels}
          currentStatus="arrived"
          countryHub
        />
      </div>
    </AdminShell>
  );
}

