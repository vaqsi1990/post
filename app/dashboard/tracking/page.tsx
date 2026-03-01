'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

type ParcelResult = {
  id: string;
  trackingNumber: string;
  status: string;
  weight: number;
  price: number;
  currency: string;
  originCountry: string;
  createdAt: string;
  tracking: { status: string; location: string | null; description: string | null; createdAt: string }[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'მოლოდინში',
  in_transit: 'გზაში',
  arrived: 'ჩამოსული',
  ready_for_pickup: 'მზადაა გატანისთვის',
  delivered: 'გატანილი',
  cancelled: 'გაუქმებული',
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') ?? '';
  const [result, setResult] = useState<ParcelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!code);

  const fetchTracking = useCallback(async (trackingCode: string) => {
    if (!trackingCode.trim()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/tracking?code=${encodeURIComponent(trackingCode.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'შეცდომა');
        setResult(null);
        return;
      }
      setResult(data.parcel);
    } catch {
      setError('შეცდომა ქსელში');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (code) fetchTracking(code);
    else setLoading(false);
  }, [code, fetchTracking]);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-2xl px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">თრექინგი</h1>
            <Link
              href="/dashboard"
              className="text-[15px] font-medium text-gray-600 hover:text-black"
            >
              ← დაბრუნება
            </Link>
          </div>

          {!code ? (
            <p className="text-[15px] text-gray-500">
              გამოიყენეთ დაშბორდის ველი თრექინგ კოდის საძიებლად ან{' '}
              <Link href="/dashboard" className="text-amber-600 hover:underline">
                დაშბორდი
              </Link>
              .
            </p>
          ) : loading ? (
            <p className="text-[15px] text-gray-500">იტვირთება...</p>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
              {error}
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
                <div className="grid grid-cols-2 gap-2 text-[14px]">
                  <span className="text-gray-500">თრექინგ კოდი</span>
                  <span className="font-medium text-black">{result.trackingNumber}</span>
                  <span className="text-gray-500">სტატუსი</span>
                  <span className="font-medium text-black">
                    {STATUS_LABELS[result.status] || result.status}
                  </span>
                  <span className="text-gray-500">წონა</span>
                  <span className="text-black">{result.weight} kg</span>
                  <span className="text-gray-500">ქვეყანა</span>
                  <span className="text-black">{result.originCountry}</span>
                </div>
              </div>
              {result.tracking.length > 0 && (
                <div>
                  <h2 className="mb-2 text-[14px] font-semibold text-gray-700">ისტორია</h2>
                  <ul className="space-y-2">
                    {result.tracking.map((t, i) => (
                      <li
                        key={i}
                        className="flex gap-2 rounded border border-gray-100 bg-white px-3 py-2 text-[14px]"
                      >
                        <span className="font-medium text-black">
                          {STATUS_LABELS[t.status] || t.status}
                        </span>
                        {t.location && <span className="text-gray-600">{t.location}</span>}
                        {t.description && <span className="text-gray-500">{t.description}</span>}
                        <span className="ml-auto text-gray-400">
                          {new Date(t.createdAt).toLocaleDateString('ka-GE')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function DashboardTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-120px)] bg-gray-100 py-8 flex items-center justify-center"><p className="text-gray-500">იტვირთება...</p></div>}>
      <TrackingContent />
    </Suspense>
  );
}
