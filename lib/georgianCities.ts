/**
 * საქართველოს ძირითადი დიდი ქალაქები (რეგისტრაციის არჩევანი).
 * `nameKa` იგზავნება API-ზე / ინახება ბაზაში; UI-ზე სახელი — next-intl `cities.{id}`.
 * თბილისი პირველია, დანარჩენი — ქართული ანბანით.
 */
const MAJOR_CITIES_UNSORTED = [
  { id: 'tbilisi', nameKa: 'თბილისი' },
  { id: 'akhaltsikhe', nameKa: 'ახალციხე' },
  { id: 'batumi', nameKa: 'ბათუმი' },
  { id: 'borjomi', nameKa: 'ბორჯომი' },
  { id: 'gardabani', nameKa: 'გარდაბანი' },
  { id: 'gori', nameKa: 'გორი' },
  { id: 'zestafoni', nameKa: 'ზესტაფონი' },
  { id: 'zugdidi', nameKa: 'ზუგდიდი' },
  { id: 'telavi', nameKa: 'თელავი' },
  { id: 'kobuleti', nameKa: 'ქობულეთი' },
  { id: 'kutaisi', nameKa: 'ქუთაისი' },
  { id: 'marneuli', nameKa: 'მარნეული' },
  { id: 'ozurgeti', nameKa: 'ოზურგეთი' },
  { id: 'rustavi', nameKa: 'რუსთავი' },
  { id: 'samtredia', nameKa: 'სამტრედია' },
  { id: 'senaki', nameKa: 'სენაკი' },
  { id: 'poti', nameKa: 'ფოთი' },
  { id: 'tsqaltubo', nameKa: 'წყალტუბო' },
  { id: 'khashuri', nameKa: 'ხაშური' },
] as const;

const TBILISI_ID = 'tbilisi';
const tbilisi = MAJOR_CITIES_UNSORTED.find((c) => c.id === TBILISI_ID)!;
const sortedRest = MAJOR_CITIES_UNSORTED.filter((c) => c.id !== TBILISI_ID).sort((a, b) =>
  a.nameKa.localeCompare(b.nameKa, 'ka')
);

export const REGISTRATION_CITIES = [tbilisi, ...sortedRest] as readonly {
  id: string;
  nameKa: string;
}[];

export const GEORGIAN_CITIES: readonly string[] = REGISTRATION_CITIES.map((c) => c.nameKa);

export const GEORGIAN_CITY_SET = new Set(GEORGIAN_CITIES);
