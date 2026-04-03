import { getLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import SupportShell from '../components/SupportShell';
import UsersTable from '@/app/admin/users/components/UsersTable';
import { formatDateDMY } from '@/lib/formatDate';

export default async function SupportUsersPage() {
  const locale = await getLocale();
  const text =
    locale === 'ru'
      ? { title: 'Пользователи', description: 'Список пользователей и ролей.' }
      : locale === 'en'
        ? { title: 'Users', description: 'List of users and roles.' }
        : { title: 'მომხმარებლები', description: 'მომხმარებლების სია და როლები.' };

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      address: true,
      role: true,
      employeeCountry: true,
      createdAt: true,
      roomNumber: true,
    },
  });

  const formattedUsers = users.map((user) => ({
    ...user,
    createdAt: formatDateDMY(user.createdAt),
  }));

  return (
    <SupportShell title={text.title} description={text.description}>
      <UsersTable users={formattedUsers} newUserHref="/support/users/new" allowDelete={false} />
    </SupportShell>
  );
}

