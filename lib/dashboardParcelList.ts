/** დეშბორდის ამანათების სია — სერვერზე გვერდი/ტაბი (ქეშირებული ტარიფებისგან დამოუკიდებლად). */

export const DASHBOARD_PARCEL_PAGE_SIZE = 15;

export const DASHBOARD_PARCEL_TAB_STATUSES = [
  'pending',
  'in_warehouse',
  'in_transit',
  'arrived',
  'stopped',
  'delivered',
] as const;

export type DashboardParcelTabStatus =
  (typeof DASHBOARD_PARCEL_TAB_STATUSES)[number];

export function parseDashboardParcelTab(
  raw: string | string[] | undefined,
): DashboardParcelTabStatus {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (
    v &&
    (DASHBOARD_PARCEL_TAB_STATUSES as readonly string[]).includes(v)
  ) {
    return v as DashboardParcelTabStatus;
  }
  return 'pending';
}

export function parseDashboardParcelPage(raw: string | undefined): number {
  const n = parseInt(raw ?? '1', 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}
