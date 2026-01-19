import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth';
import AdminSidebar from './AdminSidebar';

export default async function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-8">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <AdminSidebar />
          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-black">{title}</h1>
            {description ? <p className="mt-2 text-[16px] text-black">{description}</p> : null}
            {children ? <div className="mt-6">{children}</div> : null}
          </main>
        </div>
      </div>
    </div>
  );
}

