import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import SupportShell from './components/SupportShell';

export const dynamic = 'force-dynamic';

const STATUS_KEYS: Record<string, string> = {
  pending: 'statusPending',
  in_transit: 'statusInTransit',
  arrived: 'statusArrived',
  region: 'statusRegion',
  stopped: 'statusStopped',
  delivered: 'statusDelivered',
  ready_for_pickup: 'statusReadyForPickup',
};

export default async function SupportHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'SUPPORT') redirect(session.user.role === 'EMPLOYEE' ? '/employee' : '/');

  const parcels = await prisma.parcel.findMany({
    where: { createdById: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { email: true } },
    },
  });

  const locale = await getLocale();
  const t = await getTranslations('employeeDashboard');

  const title =
    locale === 'ru'
      ? 'Панель поддержки'
      : locale === 'en'
        ? 'Support dashboard'
        : 'საფორთის პანელი';

  const dateLocale = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-GB' : 'ka-GE';

  return (
    <SupportShell title={title} description={t('homeDescription')}>
      <div className="space-y-8">
        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6">
          <p className="text-[16px] text-black">{t('homeHint')}</p>
          <Link
            href="/support/incoming/new"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#3a5bff] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff]"
          >
            {t('addParcelCta')}
          </Link>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-[17px] font-semibold text-black">{t('myParcelsTitle')}</h2>
          {parcels.length === 0 ? (
            <p className="mt-4 text-[15px] text-gray-600">{t('myParcelsEmpty')}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-[14px] text-black">
                <thead>
                  <tr className="border-b border-gray-200 text-[13px] font-semibold text-gray-700">
                    <th className="py-2 pr-3">{t('colTracking')}</th>
                    <th className="py-2 pr-3">{t('colCustomerEmail')}</th>
                    <th className="py-2 pr-3">{t('colCustomerName')}</th>
                    <th className="py-2 pr-3">{t('colStatus')}</th>
                    <th className="py-2">{t('colDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.map((p) => {
                    const sk = STATUS_KEYS[p.status];
                    const statusLabel = sk ? t(sk as 'statusPending') : p.status;
                    return (
                      <tr key={p.id} className="border-b border-gray-100">
                        <td className="py-2.5 pr-3 font-medium">{p.trackingNumber}</td>
                        <td className="py-2.5 pr-3 break-all">{p.user.email}</td>
                        <td className="py-2.5 pr-3">{p.customerName}</td>
                        <td className="py-2.5 pr-3">{statusLabel}</td>
                        <td className="py-2.5 whitespace-nowrap text-gray-700">
                          {new Date(p.createdAt).toLocaleString(dateLocale, {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </SupportShell>
  );
}

