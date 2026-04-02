'use client';

import { useEffect, useRef, useState } from 'react';
import ParcelsTable from './ParcelsTable';

type Parcel = {
  id: string;
  trackingNumber: string;
  status: string;
  price: number;
  currency: string;
  weight: number | null;
  originCountry: string | null;
  quantity: number;
  customerName: string;
  createdAt: string;
  filePath: string | null;
  shippingAmount?: number | null;
  courierServiceRequested: boolean;
  courierFeeAmount: number | null;
  payableAmount: number | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
  };
  createdBy: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    employeeCountry: string | null;
  } | null;
};

type ParcelsManagerProps = {
  initialParcels: Parcel[];
  currentStatus: string;
};

export default function ParcelsManager({ initialParcels, currentStatus }: ParcelsManagerProps) {
  const [parcels, setParcels] = useState(initialParcels);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchParcels = async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      }
      try {
        const res = await fetch(`/api/admin/parcels?status=${currentStatus}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.parcels) {
          setParcels(data.parcels);
        }
      } catch (error) {
        console.error('Failed to fetch parcels:', error);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    };

    fetchParcels(!isInitialMount.current);
    isInitialMount.current = false;

    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          fetchParcels(false);
        }
      }, 3000);
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        fetchParcels();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentStatus]);

  const handleParcelUpdated = (updatedParcel: Parcel) => {
    if (updatedParcel.status !== currentStatus) {
      setParcels((prev) => prev.filter((p) => p.id !== updatedParcel.id));
    } else {
      setParcels((prev) =>
        prev.map((p) => (p.id === updatedParcel.id ? updatedParcel : p))
      );
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justifycenter bg-white bg-opacity-75 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
            <p className="text-[16px] text-gray-600">იტვირთება...</p>
          </div>
        </div>
      )}
      <ParcelsTable
        parcels={parcels}
        currentStatus={currentStatus}
        onParcelUpdated={handleParcelUpdated}
      />
    </div>
  );
}

