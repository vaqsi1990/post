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
  { label: 'ტარიფების შეცვლა', href: '/admin/tariffs' },
  { label: 'ჩათი', href: '/admin/chat' },
  { label: 'რეგიონი', href: '/admin/regions' },
  { label: 'პარამეტრები', href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full  lg:w-56 shrink-0">
      <div className="sticky top-4">
      
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2.5 px-2 text-[15px] font-medium transition-colors rounded-lg border-l-2 ${
                  isActive
                    ? 'border-black bg-gray-100 text-black'
                    : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

