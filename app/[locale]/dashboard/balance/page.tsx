import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import BalanceTopUp from '@/app/dashboard/balance/components/BalanceTopUp';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardBalancePage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations('common');
  const tBalance = await getTranslations('balance');

  if (!session?.user) redirect(`/${locale}/login`);
  if (session.user.role === 'ADMIN') redirect(`/${locale}/admin`);

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });

  const balance = user?.balance ?? 0;

  return (
    <div className=" bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-2xl px-4">
        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="pb-6 border-b border-gray-200">
            <Link href="/dashboard" className="text-[16px] md:text-[18px] font-medium text-black hover:text-black">
              ← {t('back')}
            </Link>
          </div>
          <div className="pt-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-6">{tBalance('title')}</h1>
            <BalanceTopUp initialBalance={balance} />
          </div>
        </main>
      </div>
    </div>
  );
}
