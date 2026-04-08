'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type AdminNavItem = {
  label: string;
  href: string;
  description?: string;
};

type NbgRatesResponse = {
  rates: Record<string, number | null>;
  fetchedAt: string;
};

type ChatThreadSummary = {
  id: string;
  status: string;
};

type ChatMessage = {
  id: string;
  sender: 'USER' | 'ADMIN';
};

type SectionCounts = {
  users: number;
  incoming: number;
  inWarehouse: number;
  inTransit: number;
  warehouse: number;
  regions: number;
  delivered: number;
  payments: number;
};

const COUNT_KEY_BY_HREF: Record<string, keyof SectionCounts> = {
  '/admin/users': 'users',
  '/admin/incoming': 'incoming',
  '/admin/in-warehouse': 'inWarehouse',
  '/admin/in-transit': 'inTransit',
  '/admin/warehouse': 'warehouse',
  '/admin/regions': 'regions',
  '/admin/delivered': 'delivered',
  '/admin/payments': 'payments',
};

const countBadgeClass =
  'ml-auto flex h-6 min-w-[1.75rem] shrink-0 items-center justify-center rounded-full bg-emerald-600 px-2 text-xs font-bold text-white ring-1 ring-emerald-400/35';

export default function AdminSidebar() {
  const t = useTranslations('adminsidebar');
  const items: AdminNavItem[] = [
    { label: t('users'), href: '/admin/users' },
    { label: t('incoming'), href: '/admin/incoming' },
    { label: t('inWarehouse'), href: '/admin/in-warehouse' },
    { label: t('inTransit'), href: '/admin/in-transit' },
    { label: t('warehouse'), href: '/admin/warehouse' },
    { label: t('regions'), href: '/admin/regions' },
    { label: t('reises'), href: '/admin/reises' },
    { label: t('delivered'), href: '/admin/delivered' },
    { label: t('payments'), href: '/admin/payments' },
    { label: t('editTariffs'), href: '/admin/tariffs' },
    { label: t('chat'), href: '/admin/chat' },
    { label: t('settings'), href: '/admin/settings' },
  ];
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [chatCounts, setChatCounts] = useState<{
    open: number;
    awaitingReply: number;
  } | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [counts, setCounts] = useState<SectionCounts | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);
  const [currencyRates, setCurrencyRates] = useState<NbgRatesResponse | null>(
    null,
  );
  const [currencyRatesLoading, setCurrencyRatesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadCounts = async () => {
      try {
        const res = await fetch('/api/admin/counts', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setCounts(data);
      } catch {
        if (!cancelled) setCounts(null);
      } finally {
        if (!cancelled) setCountsLoading(false);
      }
    };
    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadRates = async () => {
      try {
        setCurrencyRatesLoading(true);
        const res = await fetch('/api/nbg/rates?codes=GBP,USD,CNY,EUR,TRY', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as NbgRatesResponse;
        if (!cancelled && data?.rates) setCurrencyRates(data);
      } catch {
        if (!cancelled) setCurrencyRates(null);
      } finally {
        if (!cancelled) setCurrencyRatesLoading(false);
      }
    };
    void loadRates();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadChatCounts = async () => {
      try {
        setChatLoading(true);
        const res = await fetch('/api/admin/chat/threads');
        const data = await res.json();
        const threads: ChatThreadSummary[] = Array.isArray(data.threads)
          ? data.threads
          : [];

        const openThreads = threads.filter((t) => t.status === 'open');

        const awaitingReplyIds = new Set<string>();

        await Promise.all(
          openThreads.map(async (thread) => {
            try {
              const resMessages = await fetch(
                `/api/admin/chat/threads/${thread.id}`,
              );
              const dataMessages = await resMessages.json();
              const messages: ChatMessage[] = Array.isArray(
                dataMessages.messages,
              )
                ? dataMessages.messages
                : [];

              const last = messages[messages.length - 1];
              if (last && last.sender === 'USER') {
                awaitingReplyIds.add(thread.id);
              }
            } catch {
              // ignore single-thread errors
            }
          }),
        );

        if (!cancelled) {
          setChatCounts({
            open: openThreads.length,
            awaitingReply: awaitingReplyIds.size,
          });
        }
      } catch {
        if (!cancelled) {
          setChatCounts(null);
        }
      } finally {
        if (!cancelled) {
          setChatLoading(false);
        }
      }
    };

    void loadChatCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentItem =
    items.find((item) => pathname === item.href) ?? items[0];

  const getCount = (href: string): number | undefined => {
    const key = COUNT_KEY_BY_HREF[href];
    return key && counts ? counts[key] : undefined;
  };

  const showCount = (href: string) => COUNT_KEY_BY_HREF[href];

  const ratesEntries = [
    { code: 'GBP', label: 'UK' },
    { code: 'USD', label: 'US' },
    { code: 'CNY', label: 'CN' },
    { code: 'EUR', label: 'EU' },
    { code: 'TRY', label: 'TR' },
  ] as const;

  const CurrencyRatesBlock = (
    <div className="px-2 pb-2">
      <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">
            {t('currencyRates')}
          </div>
          <div className="text-[11px] text-slate-500">
            {currencyRatesLoading ? '...' : currencyRates?.fetchedAt ? 'NBG' : '—'}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {ratesEntries.map(({ code, label }) => {
            const value = currencyRates?.rates?.[code] ?? null;
            return (
              <div
                key={code}
                className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-[13px] text-slate-800 ring-1 ring-slate-200"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex min-w-7 justify-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                    {label}
                  </span>
                  <span className="font-semibold">{code}</span>
                </div>
                <div className="tabular-nums text-slate-900">
                  {currencyRatesLoading ? (
                    '...'
                  ) : value == null ? (
                    '—'
                  ) : (
                    <>
                      {value.toFixed(4)} <span className="text-slate-600">GEL</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          1 unit = GEL
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full lg:w-64 shrink-0 min-w-0">
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
            {currentItem.href === '/admin/chat' && (chatCounts || chatLoading) ? (
              <span className="flex items-center gap-1 text-xs">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800">
                  გაუხსნელი: {chatCounts?.open ?? '...'}
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                  უპასუხებელი: {chatCounts?.awaitingReply ?? '...'}
                </span>
              </span>
            ) : showCount(currentItem.href) ? (
              <span className={countBadgeClass}>
                {countsLoading ? '...' : getCount(currentItem.href) ?? '−'}
              </span>
            ) : null}
          </span>
          <span
            className={`text-slate-500 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>
        {open && (
          <div className="mt-1.5 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70 overflow-hidden">
            <nav className="flex flex-col gap-0.5 py-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push(item.href);
                    }}
                    className={`block w-full text-left py-2.5 px-3 text-[15px] font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{item.label}</span>
                      {item.href === '/admin/chat' && (chatCounts || chatLoading) ? (
                        <span className="ml-auto flex items-center gap-1 text-xs">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800">
                            {chatCounts?.open ?? '...'}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                            {chatCounts?.awaitingReply ?? '...'}
                          </span>
                        </span>
                      ) : showCount(item.href) ? (
                        <span className={countBadgeClass}>
                          {countsLoading ? '...' : getCount(item.href) ?? '−'}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </nav>
            {CurrencyRatesBlock}
          </div>
        )}
      </div>

      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-0 h-screen rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden py-2">
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
                    <span className="flex items-center justify-between gap-2">
                      <span>{item.label}</span>
                      {item.href === '/admin/chat' && (chatCounts || chatLoading) ? (
                        <span className="ml-auto flex items-center gap-1 text-xs">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800">
                            {chatCounts?.open ?? '...'}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                            {chatCounts?.awaitingReply ?? '...'}
                          </span>
                        </span>
                      ) : showCount(item.href) ? (
                        <span className={countBadgeClass}>
                          {countsLoading ? '...' : getCount(item.href) ?? '−'}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </nav>
            {CurrencyRatesBlock}
          </div>
        </div>
      </aside>
    </div>
  );
}
