import dayjs from '@/lib/dayjs';

/**
 * DD/MM/YYYY — day first, then month (not US M/D/Y).
 */
export function formatDateDMY(date: Date | string | number): string {
  const d = dayjs(date);
  if (!d.isValid()) return '';
  return d.format('DD/MM/YYYY');
}

/** DD/MM/YYYY, HH:mm:ss */
export function formatDateTimeDMY(date: Date | string | number): string {
  const d = dayjs(date);
  if (!d.isValid()) return '';
  return d.format('DD/MM/YYYY, HH:mm:ss');
}

/** DD.MM.YYYY · HH:mm (local, 24h) — compact for tables */
export function formatDateTimeDot(date: Date | string | number): string {
  const d = dayjs(date);
  if (!d.isValid()) return '';
  return d.format('DD.MM.YYYY · HH:mm');
}
