'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function EmployeeSidebar() {
  const t = useTranslations('employeeSidebar');
  const pathname = usePathname();

  const items = [
    { label: t('home'), href: '/employee' },
    { label: t('addParcel'), href: '/employee/parcels/new' },
  ];

  return (
    <div className="w-full lg:w-52 shrink-0 min-w-0">
      <div className="mb-4 lg:hidden">
        <nav className="flex flex-col gap-0.5 rounded-xl border border-slate-200 bg-white py-2 shadow-lg shadow-slate-200/70 overflow-hidden">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2.5 px-3 text-[15px] font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-4 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70 overflow-hidden">
          <div className="max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden py-2">
            <nav className="flex flex-col gap-0.5 px-2">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-2.5 px-3 text-[15px] font-medium transition-colors rounded-lg border-l-2 ${
                      isActive
                        ? 'border-emerald-700 bg-emerald-200 text-emerald-950'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </div>
  );
}
