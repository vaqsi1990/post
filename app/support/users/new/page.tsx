import { getLocale } from 'next-intl/server';
import SupportShell from '../../components/SupportShell';
import AdminCreateUserForm from '@/app/admin/users/components/AdminCreateUserForm';

export const dynamic = 'force-dynamic';

export default async function SupportUsersNewPage() {
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? { title: 'Новый пользователь', description: 'Заполните форму для ручной регистрации нового пользователя.' }
      : locale === 'en'
        ? { title: 'New User', description: 'Fill out the form to register a new user manually.' }
        : { title: 'ახალი მომხმარებელი', description: 'შეავსეთ ფორმა ახალი მომხმარებლის ხელით რეგისტრაციისთვის.' };

  return (
    <SupportShell title={text.title} description={text.description}>
      <AdminCreateUserForm postUrl="/api/admin/users" successRedirect="/support/users" />
    </SupportShell>
  );
}

