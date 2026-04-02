/** Prisma EmployeeCountry (GB, US, …) — UI ენის მიხედვით */
const LABELS: Record<string, Record<'ka' | 'en' | 'ru', string>> = {
  GB: { ka: 'დიდი ბრიტანეთი', en: 'United Kingdom', ru: 'Великобритания' },
  US: { ka: 'აშშ', en: 'USA', ru: 'США' },
  CN: { ka: 'ჩინეთი', en: 'China', ru: 'Китай' },
  IT: { ka: 'იტალია', en: 'Italy', ru: 'Италия' },
  GR: { ka: 'საბერძნეთი', en: 'Greece', ru: 'Греция' },
  ES: { ka: 'ესპანეთი', en: 'Spain', ru: 'Испания' },
  FR: { ka: 'საფრანგეთი', en: 'France', ru: 'Франция' },
  DE: { ka: 'გერმანია', en: 'Germany', ru: 'Германия' },
  TR: { ka: 'თურქეთი', en: 'Turkey', ru: 'Турция' },
};

export function employeeCountryLabel(
  code: string | null | undefined,
  locale: string,
): string {
  if (!code) return '—';
  const entry = LABELS[code];
  if (!entry) return code;
  const lang = locale === 'en' ? 'en' : locale === 'ru' ? 'ru' : 'ka';
  return entry[lang];
}
