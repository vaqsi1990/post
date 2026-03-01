'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewParcelPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [originCountry, setOriginCountry] = useState('US');
  const [originAddress, setOriginAddress] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const w = parseFloat(weight.replace(',', '.'));
    if (isNaN(w) || w < 0) {
      setError('წონა უნდა იყოს დადებითი რიცხვი');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          originCountry: originCountry.trim() || 'US',
          originAddress: originAddress.trim() || '—',
          weight: w,
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'შეცდომა');
        setLoading(false);
        return;
      }
      router.push(`/dashboard/tracking?code=${encodeURIComponent(data.parcel.trackingNumber)}`);
      router.refresh();
    } catch {
      setError('შეცდომა ქსელში');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-lg px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">ამანათის დამატება</h1>
            <Link
              href="/dashboard"
              className="text-[15px] font-medium text-gray-600 hover:text-black"
            >
              ← დაბრუნება
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="trackingNumber" className="mb-1 block text-[14px] font-medium text-gray-700">
                თრექინგ კოდი *
              </label>
              <input
                id="trackingNumber"
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="მაგ. 1Z999AA10123456784"
              />
            </div>
            <div>
              <label htmlFor="originCountry" className="mb-1 block text-[14px] font-medium text-gray-700">
                ქვეყანა
              </label>
              <input
                id="originCountry"
                type="text"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="US"
              />
            </div>
            <div>
              <label htmlFor="originAddress" className="mb-1 block text-[14px] font-medium text-gray-700">
                გამგზავნის მისამართი
              </label>
              <input
                id="originAddress"
                type="text"
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="სრული მისამართი (არასავალდებულო)"
              />
            </div>
            <div>
              <label htmlFor="weight" className="mb-1 block text-[14px] font-medium text-gray-700">
                წონა (კგ)
              </label>
              <input
                id="weight"
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="description" className="mb-1 block text-[14px] font-medium text-gray-700">
                აღწერა (არასავალდებულო)
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-black hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-70"
              >
                {loading ? 'იგზავნება...' : 'დამატება'}
              </button>
              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50"
              >
                გაუქმება
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
