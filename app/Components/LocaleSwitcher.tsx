'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import GE from 'country-flag-icons/react/3x2/GE';
import GB from 'country-flag-icons/react/3x2/GB';

const localeConfig: Record<string, { label: string; Flag: React.ComponentType<{ title?: string; className?: string }> }> = {
  ka: { label: 'ქართ', Flag: GE },
  en: { label: 'Eng', Flag: GB },
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = localeConfig[locale] ?? { label: locale, Flag: GE };

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-white bg-transparent hover:bg-white/10 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Switch language"
        suppressHydrationWarning
      >
        <current.Flag className="w-5 h-[10px] object-cover rounded-sm shrink-0" title={current.label} />
        <span>{current.label}</span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-gray-200 bg-black py-1 shadow-lg backdrop-blur-sm"
          role="listbox"
        >
          {routing.locales.map((loc) => {
            const config = localeConfig[loc];
            const Flag = config?.Flag ?? GE;
            const label = config?.label ?? loc;
            const isSelected = locale === loc;
            return (
              <button
                key={loc}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => switchLocale(loc)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                  isSelected ? 'bg-white/15 text-white' : 'text-white hover:bg-white/10'
                }`}
              >
                <Flag className="w-5 h-[10px] object-cover rounded-sm shrink-0" title={label} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
