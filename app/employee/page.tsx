import { Link } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import EmployeeShell from './components/EmployeeShell';

export const dynamic = 'force-dynamic';

export default async function EmployeeHomePage() {
  const locale = await getLocale();
  const t = await getTranslations('employeeDashboard');

  const title =
    locale === 'ru'
      ? 'Панель сотрудника'
      : locale === 'en'
        ? 'Employee dashboard'
        : 'თანამშრომლის პანელი';

  return (
    <EmployeeShell title={title} description={t('homeDescription')}>
      <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6">
        <p className="text-[16px] text-black">{t('homeHint')}</p>
        <Link
          href="/employee/parcels/new"
          className="mt-5 rounded-xl inline-flex flex justify-center items-center  text-centerrounded-lg text-center bg-[#3a5bff] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff] mx-auto lg:mx-0"
        >
          {t('addParcelCta')}
        </Link>
      </div>
    </EmployeeShell>
  );
}
