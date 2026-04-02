import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import SettingsProfileForm from './components/SettingsProfileForm';
import SettingsPasswordForm from './components/SettingsPasswordForm';

export const dynamic = 'force-dynamic';

export default async function DashboardSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');
  if (session.user.role === 'EMPLOYEE') redirect('/employee');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      phoneVerified: true,
      personalIdNumber: true,
      postalIndex: true,
    },
  });

  if (!user) redirect('/login');

  const profile = {
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? '',
    phoneVerified: user.phoneVerified ?? false,
    personalIdNumber: user.personalIdNumber,
    postalIndex: user.postalIndex ?? '',
  };

  return (
    <div className=" bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-3xl px-4">
        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="pb-6 border-b border-gray-200">
            <Link href="/dashboard" className="text-[16px] md:text-[18px] font-medium text-black hover:text-black">
              ← უკან დაბრუნება
            </Link>
          </div>
          <div className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-900">პარამეტრები</h1>
            </div>
            <div className="space-y-8">
              <SettingsProfileForm initialProfile={profile} />
              <SettingsPasswordForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
