'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import OrdersTable from '../../components/OrdersTable';
import CreateOrderModal from './CreateOrderModal';

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
};

export default function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  
  // Debug: Log when orders state changes
  useEffect(() => {
    console.log('[OrdersManager] orders state changed:', orders.length, 'Order IDs:', orders.map(o => o.id));
    console.log('[OrdersManager] Passing orders to OrdersTable:', orders.length, 'Order IDs:', orders.map(o => o.id));
  }, [orders]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const currentStatus = 'in_transit';

  const fetchOrders = useCallback(async (showLoading = true, preserveOptimisticOrder?: string) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      console.log('[OrdersManager] Fetching orders, preserveOptimisticOrder:', preserveOptimisticOrder);
      const res = await fetch(`/api/admin/orders?status=${currentStatus}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!res.ok) {
        console.error('[OrdersManager] Fetch failed, status:', res.status);
        return;
      }
      const data = await res.json();
      console.log('[OrdersManager] Fetched orders:', data.orders?.length || 0, 'orders');
      if (data.orders) {
        setOrders((prev) => {
          console.log('[OrdersManager] Current orders before update:', prev.length);
          // If we're preserving an optimistic order, check if it's in the fetched data
          if (preserveOptimisticOrder) {
            const optimisticOrder = prev.find((o) => o.id === preserveOptimisticOrder);
            const fetchedOrder = data.orders.find((o: Order) => o.id === preserveOptimisticOrder);
            console.log('[OrdersManager] Optimistic order exists:', !!optimisticOrder, 'Fetched order exists:', !!fetchedOrder);
            // If optimistic order exists but not in fetched data, keep it
            if (optimisticOrder && !fetchedOrder) {
              console.log('[OrdersManager] Preserving optimistic order');
              return [optimisticOrder, ...data.orders];
            }
          }
          console.log('[OrdersManager] Setting orders to fetched data:', data.orders.length);
          return data.orders;
        });
      }
    } catch (error) {
      console.error('[OrdersManager] Failed to fetch orders:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [currentStatus]);

  // Sync local state with prop changes (when server component refreshes)
  // Only sync on initial mount or if initialOrders has more items than current state
  // This prevents overwriting optimistic updates or fresh fetched data
  useEffect(() => {
    setOrders((current) => {
      console.log('[OrdersManager] initialOrders changed, current orders:', current.length, 'initialOrders:', initialOrders.length);
      // Always sync on initial mount (when current is empty or matches initial)
      if (current.length === 0 || 
          (current.length === initialOrders.length && 
           current.every(co => initialOrders.some(io => io.id === co.id)))) {
        console.log('[OrdersManager] Syncing initialOrders (initial mount or exact match)');
        return initialOrders;
      }
      
      // If initialOrders has items not in current state, merge them
      const currentIds = new Set(current.map(o => o.id));
      const newOrders = initialOrders.filter(io => !currentIds.has(io.id));
      
      if (newOrders.length > 0) {
        console.log('[OrdersManager] Merging', newOrders.length, 'new orders from initialOrders');
        // Merge new orders from initialOrders with current state
        return [...newOrders, ...current];
      }
      
      // No new items, keep current state
      console.log('[OrdersManager] Keeping current state (no new items in initialOrders)');
      return current;
    });
  }, [initialOrders]);

  useEffect(() => {
    // Always fetch orders immediately when component mounts to get fresh data
    // This ensures we have the latest data even if server-side data was cached
    fetchOrders(false); // Don't show loading on initial mount to avoid flash
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
      }, 2000); // Poll every 3 seconds for faster updates
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
        fetchOrders(true); // Fetch immediately when page becomes visible
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup interval and event listener on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleOrderCreated = useCallback(async (newOrder: Order) => {
    console.log('[OrdersManager] handleOrderCreated called with full order:', newOrder);
    console.log('[OrdersManager] Order details:', {
      id: newOrder.id,
      status: newOrder.status,
      totalAmount: newOrder.totalAmount,
      hasUser: !!newOrder.user,
      userEmail: newOrder.user?.email
    });
    
    // Validate order structure
    if (!newOrder.id || !newOrder.status) {
      console.error('[OrdersManager] Invalid order structure:', newOrder);
      return;
    }
    
    // Only add order if it's in_transit status (should always be true for this page)
    if (newOrder.status !== 'in_transit') {
      console.warn('[OrdersManager] Order status is not in_transit, skipping:', newOrder.status);
      return;
    }
    
    // Immediately add the new order to the list optimistically
    // This ensures the user sees the new order right away
    setOrders((prev) => {
      console.log('[OrdersManager] Current orders before optimistic update:', prev.length, prev.map(o => o.id));
      // Check if order already exists to avoid duplicates
      if (prev.some((o) => o.id === newOrder.id)) {
        console.log('[OrdersManager] Order already exists, skipping');
        return prev;
      }
      console.log('[OrdersManager] Adding new order optimistically:', newOrder.id);
      // Add new order at the beginning (most recent first, matching API orderBy)
      const updated = [newOrder, ...prev];
      console.log('[OrdersManager] Orders after optimistic update:', updated.length, updated.map(o => o.id));
      return updated;
    });
    
    // Force a re-render check
    console.log('[OrdersManager] State updated, should see order in UI now');
    
    // Fetch after a delay to ensure database transaction is committed
    // This will get the fresh data from the database and confirm the order exists
    // We preserve the optimistic order in case the fetch happens before DB commit
    setTimeout(async () => {
      console.log('[OrdersManager] Fetching orders to confirm new order exists');
      await fetchOrders(false, newOrder.id); // Don't show loading since we already added it optimistically
      console.log('[OrdersManager] Fetch completed');
      
      // Refresh server components after fetch to ensure everything is in sync
      // This will update the initialOrders prop with the latest data
      router.refresh();
    }, 1000); // Delay to ensure DB transaction is fully committed
  }, [router, fetchOrders]);

  const handleOrderRemoved = (orderId: string) => {
    // Order already removed from OrdersTable state, just sync here
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    // If status changed away from 'in_transit', remove from list
    if (updatedOrder.status !== 'in_transit') {
      setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
    } else {
      // Update order in list
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black">ნივთების სია</h2>
        <CreateOrderModal onOrderCreated={handleOrderCreated} />
      </div>
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
          key={orders.length} // Force re-render when orders count changes
          orders={orders}
          currentStatus="in_transit"
          onOrderRemoved={handleOrderRemoved}
          onOrderUpdated={handleOrderUpdated}
        />
      </div>
    </>
  );
}
