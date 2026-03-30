import AdminShell from '../components/AdminShell';
import ReisesManager from './ReisesManager';
import { getLocale } from 'next-intl/server';

export default async function AdminReisesPage() {
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? { title: 'Рейсы', description: 'Создание и редактирование рейсов.' }
      : locale === 'en'
        ? { title: 'Flights', description: 'Create and manage flights.' }
        : { title: 'რეისები', description: 'რეისების დამატება და რედაქტირება.' };
  return (
    <AdminShell title={text.title} description={text.description}>
      <ReisesManager />
    </AdminShell>
  );
}
