'use client';

import { useState } from 'react';

export default function SettingsPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'ახალი პაროლები არ ემთხვევა' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'ახალი პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'შეცდომა' });
        setLoading(false);
        return;
      }
      setMessage({ type: 'success', text: data.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setMessage({ type: 'error', text: 'შეცდომა ქსელში' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
      <h2 className="text-[16px] font-semibold text-gray-900 mb-4">პაროლის შეცვლა</h2>
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
          <label htmlFor="settings-currentPassword" className="mb-1 block text-[14px] font-medium text-gray-700">
            მიმდინარე პაროლი
          </label>
          <input
            id="settings-currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label htmlFor="settings-newPassword" className="mb-1 block text-[14px] font-medium text-gray-700">
            ახალი პაროლი
          </label>
          <input
            id="settings-newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="მინიმუმ 6 სიმბოლო"
          />
        </div>
        <div>
          <label htmlFor="settings-confirmPassword" className="mb-1 block text-[14px] font-medium text-gray-700">
            ახალი პაროლი (კიდევ ერთხელ)
          </label>
          <input
            id="settings-confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-70"
        >
          {loading ? 'იგზავნება...' : 'პაროლის შეცვლა'}
        </button>
      </form>
    </section>
  );
}
