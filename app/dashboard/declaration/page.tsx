import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '../../../lib/auth';
import DeclarationForm from './components/DeclarationForm';

export const dynamic = 'force-dynamic';

export default async function DeclarationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');
  if (session.user.role === 'EMPLOYEE') redirect('/employee');

  return (
    <div className=" bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-lg px-4">
        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="pb-6 border-b border-gray-200">
            <Link href="/dashboard" className="text-[16px] md:text-[18px] font-medium text-black hover:text-black">
              ← უკან დაბრუნება
            </Link>
          </div>
          <div className="pt-6">
            <DeclarationForm />
          </div>
        </main>
      </div>
    </div>
  );
}
