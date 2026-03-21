/**
 * DD/MM/YYYY — day first, then month (not US M/D/Y).
 */
export function formatDateDMY(date: Date | string | number): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** DD/MM/YYYY, HH:mm:ss */
export function formatDateTimeDMY(date: Date | string | number): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const datePart = formatDateDMY(d);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${datePart}, ${h}:${min}:${s}`;
}
