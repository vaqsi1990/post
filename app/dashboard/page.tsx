import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-8">
      <div className="mx-auto w-full max-w-5xl px-4">
        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-black">ჩემი კაბინეტი</h1>
          <p className="mt-2 text-[16px] text-black">
            თქვენ ხართ შესული როგორც <span className="font-semibold">{session.user.email}</span>
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-[16px] text-black">შეკვეთები</p>
              <p className="mt-1 text-2xl font-bold text-black">—</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-[16px] text-black">პროფილი</p>
              <p className="mt-1 text-2xl font-bold text-black">—</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

