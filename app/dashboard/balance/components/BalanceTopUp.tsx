'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  initialBalance: number;
};

export default function BalanceTopUp({ initialBalance }: Props) {
  const t = useTranslations('balance');
  const tCommon = useTranslations('common');
  const [balance, setBalance] = useState(initialBalance);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBalance(initialBalance);
  }, [initialBalance]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const value = parseFloat(amount.replace(',', '.'));
    if (isNaN(value) || value < 0.01) {
      setMessage({ type: 'error', text: t('minAmount') });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value, currency: 'USD' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || tCommon('error') });
        setLoading(false);
        return;
      }
      setBalance(data.balance);
      setAmount('');
      setMessage({ type: 'success', text: data.message });
    } catch {
      setMessage({ type: 'error', text: tCommon('networkError') });
    } finally {
      setLoading(false);
    }
  }

  const quickAmounts = [10, 25, 50, 100, 200, 500];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
        <h2 className="text-[16px] font-semibold text-gray-900 mb-2">{t('currentBalance')}</h2>
        <p className="text-2xl font-bold text-black">
          {balance.toFixed(2)} <span className="text-[18px] font-semibold text-gray-600">USD</span>
        </p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
        <h2 className="text-[16px] font-semibold text-gray-900 mb-4">{t('topUp')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div
              className={`rounded-lg px-4 py-3 text-[15px] ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}
          <div>
            <label htmlFor="balance-amount" className="mb-1 block text-[14px] font-medium text-gray-700">
              {t('amount')}
            </label>
            <input
              id="balance-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder={t('amountPlaceholder')}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-50"
              >
                {q} USD
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? tCommon('sending') : t('topUpButton')}
          </button>
        </form>
      </section>
    </div>
  );
}
