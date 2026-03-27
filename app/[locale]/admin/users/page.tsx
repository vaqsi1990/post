import AdminShell from '@/app/admin/components/AdminShell';
import { formatDateDMY } from '@/lib/formatDate';
import prisma from '@/lib/prisma';
import UsersTable from '@/app/admin/users/components/UsersTable';

type Props = { params: Promise<{ locale: string }> };

export default async function AdminUsersPageLocale(_props: Props) {
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
    <AdminShell
      title="მომხმარებლები"
      description="მომხმარებლების სია და როლები."
    >
      <UsersTable users={formattedUsers} />
    </AdminShell>
  );
}

