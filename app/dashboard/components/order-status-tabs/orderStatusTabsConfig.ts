export const ORDER_STATUS_TAB_KEYS = [
  'pending',
  'warehouse',
  'in_transit',
  'stopped',
  'delivered',
] as const;

export type OrderStatusTabKey = (typeof ORDER_STATUS_TAB_KEYS)[number] | 'other';

export const ORDER_STATUS_TABS: { key: OrderStatusTabKey }[] = [
  { key: 'pending' },
  { key: 'warehouse' },
  { key: 'in_transit' },
  { key: 'stopped' },
  { key: 'delivered' },
];

export function normalizeOrderStatus(status: string): OrderStatusTabKey {
  if (ORDER_STATUS_TAB_KEYS.includes(status as (typeof ORDER_STATUS_TAB_KEYS)[number])) {
    return status as (typeof ORDER_STATUS_TAB_KEYS)[number];
  }
  return 'other';
}
