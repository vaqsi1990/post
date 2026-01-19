
'use client';

import { useState, useEffect, useRef } from 'react';
import OrdersTable from './OrdersTable';

type Order = {
  id: string;
  type: string;
  status: string;
  totalAmount: number;
  currency: string;
  weight: string;
  smsSent: boolean;
  notes: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

type OrdersManagerProps = {
  initialOrders: Order[];
  currentStatus: string;
};

export default function OrdersManager({ initialOrders, currentStatus }: OrdersManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchOrders = async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      }
      try {
        const res = await fetch(`/api/admin/orders?status=${currentStatus}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    };

    // Fetch orders immediately when component mounts or status changes (without loading on initial mount)
    fetchOrders(!isInitialMount.current);
    isInitialMount.current = false;

    // Set up polling every 5 seconds, but only when page is visible
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          fetchOrders(false); // Don't show loading on polling
        }
      }, 3000); // Poll every 3 seconds for faster updates
    };

    startPolling();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        fetchOrders(); // Fetch immediately when page becomes visible
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup interval and event listener on unmount or status change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentStatus]);

  const handleOrderRemoved = (orderId: string) => {
    // Order already removed from OrdersTable state, just sync here
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    // If status changed away from current status, remove from list
    if (updatedOrder.status !== currentStatus) {
      setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
    } else {
      // Update order in list
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
            <p className="text-[16px] text-gray-600">იტვირთება...</p>
          </div>
        </div>
      )}
      <OrdersTable
        orders={orders}
        currentStatus={currentStatus}
        onOrderRemoved={handleOrderRemoved}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}
