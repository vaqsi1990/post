'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function DashboardHeader() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navOpen) return;
    const close = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setNavOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [navOpen]);

  return (
    <header className="border-b border-gray-200 bg-white pb-4 mb-6 overflow-hidden">
      {/* Top row: dropdown on small screens, links on sm+ */}
      <div className="relative flex items-center justify-between" ref={navRef}>
        {/* Mobile: dropdown */}
        <div className="sm:hidden relative w-full">
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            className="flex flex-nowrap items-center justify-between gap-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            aria-expanded={navOpen}
            aria-haspopup="true"
          >
            <span className="whitespace-nowrap">მენიუ</span>
            <svg className={`w-5 h-5 shrink-0 text-gray-500 transition-transform ${navOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {navOpen && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50"
                onClick={() => setNavOpen(false)}
              >
               
                მთავარი გვერდი
              </Link>
              <Link
                href="/dashboard/addresses"
                className="flex items-center gap-2 px-3 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 relative"
                onClick={() => setNavOpen(false)}
              >
               
              მისამართები
           
              </Link>
              <Link
                href="/dashboard/balance"
                className="flex items-center gap-2 px-3 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50"
                onClick={() => setNavOpen(false)}
              >
                ბალანსის შევსება
              </Link>
              <Link
                href="/dashboard/declaration"
                className="flex items-center gap-2 px-3 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50"
                onClick={() => setNavOpen(false)}
              >
                დეკლარაცია
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-3 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50"
                onClick={() => setNavOpen(false)}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                პარამეტრები
              </Link>
            </div>
          )}
        </div>
        {/* Desktop: links */}
        <div className="hidden sm:flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[15px] font-medium text-gray-700 hover:text-black">
             
              მთავარი გვერდი
            </Link>
            <Link href="/dashboard/addresses" className="flex items-center gap-2 text-[15px] font-medium text-gray-700 hover:text-black relative">
              
              მისამართები
           
            </Link>
            <Link href="/dashboard/balance" className="flex items-center gap-2 text-[15px] font-medium text-gray-700 hover:text-black">
             
              ბალანსის შევსება
            </Link>
            <Link href="/dashboard/declaration" className="flex items-center gap-2 text-[15px] font-medium text-gray-700 hover:text-black">
              დეკლარაცია
            </Link>
          </div>
          <Link href="/dashboard/settings" className="flex items-center gap-2 text-[15px] font-medium text-gray-700 hover:text-black">
           
            პარამეტრები
          </Link>
        </div>
      </div>

      {/* Middle row: stack on mobile, row on larger screens */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mt-4">
        <input
          type="text"
          placeholder="შეიყვანეთ თრექინგ კოდი..."
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (trackingCode.trim()) router.push(`/dashboard/tracking?code=${encodeURIComponent(trackingCode.trim())}`);
            }
          }}
          className="w-full sm:flex-1 sm:min-w-[180px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
        />
        <button
          type="button"
          onClick={() => {
            if (trackingCode.trim()) router.push(`/dashboard/tracking?code=${encodeURIComponent(trackingCode.trim())}`);
          }}
          className="w-full sm:w-auto rounded-lg bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 shrink-0"
        >
          ძებნა
        </button>
        <Link
          href="/dashboard/parcels/new"
          className="w-full sm:w-auto rounded-lg bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 shrink-0 text-center"
        >
          ამანათის დამატება
        </Link>
      </div>
    </header>
  );
}
