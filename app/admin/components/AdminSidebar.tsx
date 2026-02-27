'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type AdminNavItem = {
  label: string;
  href: string;
  description?: string;
};

const items: AdminNavItem[] = [
  { label: 'მომხმარებლები', href: '/admin/users' },
  { label: 'გზაში', href: '/admin/in-transit' },
  { label: 'საწყობში', href: '/admin/warehouse' },
  { label: 'გაჩერებული', href: '/admin/stopped' },
  { label: 'გაცემული', href: '/admin/delivered' },
  { label: 'გადახდები', href: '/admin/payments' },
  { label: 'ტარიფები', href: '/admin/tariffs' },
  { label: 'ჩათი', href: '/admin/chat' },
  { label: 'რეგიონი', href: '/admin/regions' },
  { label: 'პარამეტრები', href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-[320px]">
      <div className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <p className="text-[16px] font-semibold text-black">Admin Panel</p>
     
        </div>

        <nav className="space-y-2">
          {items.map((item) => (
            (() => {
              const isActive = pathname === item.href;
              const base =
                'block rounded-xl border p-3 transition';
              const active =
                'border-black bg-gray-50';
              const inactive =
                'border-gray-200 hover:border-black hover:bg-gray-50';
              return (
            <Link
              key={item.href}
              href={item.href}
              className={`${base} ${isActive ? active : inactive}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[16px] font-semibold text-black">{item.label}</span>
                <span className="text-[16px] text-black">{'→'}</span>
              </div>
            </Link>
              );
            })()
          ))}
        </nav>
      </div>
    </aside>
  );
}

