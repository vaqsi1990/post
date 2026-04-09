'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SupportSidebar() {
  const tEmployee = useTranslations('employeeSidebar');
  const tAdmin = useTranslations('adminsidebar');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => [
      { label: tEmployee('home'), href: '/support' },
      { label: tEmployee('users'), href: '/support/users' },

      // Parcels status lists (support should match admin UX)
      { label: tAdmin('incoming'), href: '/support/incoming' },
      { label: tAdmin('inWarehouse'), href: '/support/in-warehouse' },
      { label: tAdmin('inTransit'), href: '/support/in-transit' },
      { label: tAdmin('warehouse'), href: '/support/warehouse' },
      { label: tAdmin('regions'), href: '/support/regions' },
      { label: tAdmin('stopped'), href: '/support/stopped' },
      { label: tAdmin('delivered'), href: '/support/delivered' },

      { label: tAdmin('chat'), href: '/support/chat' },

     
    ],
    [tEmployee, tAdmin],
  );

  const isActiveHref = (href: string) => pathname === href || pathname.endsWith(href);
  const currentItem = items.find((i) => isActiveHref(i.href)) ?? items[0];

  return (
    <div className="w-full lg:w-52 shrink-0 min-w-0">
      {/* Mobile: dropdown menu */}
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[15px] font-medium text-slate-800 shadow-md shadow-slate-200/80"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <span className="flex items-center gap-2">
            <span>{currentItem.label}</span>
          </span>
          <span className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {open && (
          <div className="mt-1.5 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70 overflow-hidden">
            <nav className="flex flex-col gap-0.5 py-1">
              {items.map((item) => {
                const active = isActiveHref(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setOpen(false);
                    }}
                    className={`block w-full text-left py-2.5 px-3 text-[15px] font-medium transition-colors ${
                      active
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-4 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70 overflow-hidden">
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden py-2">
            <nav className="flex flex-col gap-0.5 px-2">
              {items.map((item) => {
                const active = isActiveHref(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-2.5 px-3 text-[15px] font-medium transition-colors rounded-lg border-l-2 ${
                      active
                        ? 'border-black bg-white text-black'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{item.label}</span>
                    </span>
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

