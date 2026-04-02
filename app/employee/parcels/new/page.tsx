import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { EMPLOYEE_DB_TO_FORM_ORIGIN_CODE } from '@/lib/employeeOriginFormCode';
import EmployeeShell from '../../components/EmployeeShell';
import AdminCreateParcelForm from '@/app/admin/components/AdminCreateParcelForm';

export const dynamic = 'force-dynamic';

export default async function EmployeeNewParcelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'EMPLOYEE') redirect('/');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { employeeCountry: true },
  });

  const locale = await getLocale();
  const t = await getTranslations('employeeDashboard');

  const title =
    locale === 'ru'
      ? 'Добавить посылку'
      : locale === 'en'
        ? 'Add parcel'
        : 'ამანათის დამატება';

  const formCode = user?.employeeCountry
    ? EMPLOYEE_DB_TO_FORM_ORIGIN_CODE[user.employeeCountry]
    : undefined;
  const allowedOriginCountryCodes = formCode ? [formCode] : undefined;

  return (
    <EmployeeShell title={title} description="">
      {!user?.employeeCountry ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] text-amber-950">
          {t('missingEmployeeCountry')}
        </div>
      ) : (
        <AdminCreateParcelForm
          postUrl="/api/admin/parcels"
          tariffsUrl="/api/admin/tariffs"
          successRedirect="/employee"
          allowedOriginCountryCodes={allowedOriginCountryCodes}
        />
      )}
    </EmployeeShell>
  );
}
