import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import EmployeeShell from './components/EmployeeShell';
import EmployeeMyParcelsTable from './components/EmployeeMyParcelsTable';

export const dynamic = 'force-dynamic';

export default async function EmployeeHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'EMPLOYEE') {
    redirect(session.user.role === 'SUPPORT' ? '/support' : '/');
  }

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
      ? 'Панель сотрудника'
      : locale === 'en'
        ? 'Employee dashboard'
        : 'თანამშრომლის პანელი';

  const dateLocale = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-GB' : 'ka-GE';

  return (
    <EmployeeShell title={title} description={t('homeDescription')}>
      <div className="space-y-8">
        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6">
          <p className="text-[16px] text-black">{t('homeHint')}</p>
          <Link
            href="/employee/parcels/new"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#3a5bff] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff]"
          >
            {t('addParcelCta')}
          </Link>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-[17px] font-semibold text-black">{t('myParcelsTitle')}</h2>
          <EmployeeMyParcelsTable
            rows={parcels.map((p) => ({
              id: p.id,
              status: p.status,
              trackingNumber: p.trackingNumber,
              customerEmail: p.user.email,
              customerName: p.customerName,
              dateFormatted: new Date(p.createdAt).toLocaleString(dateLocale, {
                dateStyle: 'short',
                timeStyle: 'short',
              }),
            }))}
          />
        </section>
      </div>
    </EmployeeShell>
  );
}
