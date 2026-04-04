'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function EmployeeSidebar() {
  const t = useTranslations('employeeSidebar');
  const pathname = usePathname();

  return (
    <div className="w-full lg:w-52 shrink-0 min-w-0">
      <div className="mb-4 lg:hidden">
        <div className="rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70 overflow-hidden">
          <div className="py-2">
            <nav className="flex flex-col gap-0.5 px-2">
              <Link
                href="/employee"
                className={`block py-2.5 px-3 text-[15px] font-medium transition-colors rounded-lg border-l-2 ${
                  pathname === '/employee'
                    ? 'border-emerald-700 bg-emerald-200 text-emerald-950'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                href="/employee/parcels/new"
                className={`block py-2.5 px-3 text-[15px] bg-[#3a5bff] font-medium transition-colors rounded-lg border-l-2 ${
                  pathname === '/employee/parcels/new'
                    ? 'border-emerald-700 bg-[#3a5bff] text-white'
                    : 'border-transparent text-white hover:bg-[#3a5bff] hover:text-white'
                }`}
              >
                {t('addParcel')}
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-4 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70 overflow-hidden">
          <div className="max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden py-2">
            <nav className="flex flex-col gap-0.5 px-2">
              <Link
                href="/employee"
                className={`block py-2.5 px-3 text-[15px] font-medium transition-colors rounded-lg border-l-2 ${
                  pathname === '/employee'
                    ? 'border-emerald-700 bg-emerald-200 text-emerald-950'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                href="/employee/parcels/new"
                className={`block py-2.5 px-3 text-[15px] bg-[#3a5bff] font-medium transition-colors rounded-lg border-l-2 ${
                  pathname === '/employee/parcels/new'
                    ? 'border-emerald-700 bg-[#3a5bff] text-white'
                    : 'border-transparent text-white hover:bg-[#3a5bff] hover:text-white'
                }`}
              >
                {t('addParcel')}
              </Link>
            </nav>
          </div>
        </div>
      </aside>
    </div>
  );
}
