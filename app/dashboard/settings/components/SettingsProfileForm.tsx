'use client';

import { useState } from 'react';

type Profile = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  phoneVerified: boolean;
  personalIdNumber: string;
};

type Props = {
  initialProfile: Profile;
};

export default function SettingsProfileForm({ initialProfile }: Props) {
  const [firstName, setFirstName] = useState(initialProfile.firstName);
  const [lastName, setLastName] = useState(initialProfile.lastName);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'შეცდომა' });
        setLoading(false);
        return;
      }
      setMessage({ type: 'success', text: data.message });
    } catch {
      setMessage({ type: 'error', text: 'შეცდომა ქსელში' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
      <h2 className="text-[16px] font-semibold text-gray-900 mb-4">პროფილის მონაცემები</h2>
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
          <label htmlFor="settings-email" className="mb-1 block text-[14px] font-medium text-gray-700">
            ელფოსტა
          </label>
          <input
            id="settings-email"
            type="email"
            value={initialProfile.email}
            readOnly
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-[15px] text-gray-600 cursor-not-allowed"
          />
          <p className="mt-1 text-[13px] text-gray-500">ელფოსტის შეცვლა მხარდაჭერილი არ არის</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-firstName" className="mb-1 block text-[14px] font-medium text-gray-700">
              სახელი
            </label>
            <input
              id="settings-firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="სახელი"
            />
          </div>
          <div>
            <label htmlFor="settings-lastName" className="mb-1 block text-[14px] font-medium text-gray-700">
              გვარი
            </label>
            <input
              id="settings-lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="გვარი"
            />
          </div>
        </div>
        <div>
          <label htmlFor="settings-phone" className="mb-1 block text-[14px] font-medium text-gray-700">
            ტელეფონი
          </label>
          <input
            id="settings-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="+995..."
          />
          {initialProfile.phoneVerified && (
            <p className="mt-1 text-[13px] text-green-600">ნომერი დადასტურებულია</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-medium text-gray-700">
            პირადი ნომერი
          </label>
          <input
            type="text"
            value={initialProfile.personalIdNumber}
            readOnly
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-[15px] text-gray-600 cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-70"
        >
          {loading ? 'იგზავნება...' : 'ცვლილებების შენახვა'}
        </button>
      </form>
    </section>
  );
}
