import AdminShell from '../components/AdminShell';
import { formatDateDMY } from '../../../lib/formatDate';
import prisma from '../../../lib/prisma';
import UsersTable from './components/UsersTable';

export default async function AdminUsersPage() {
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

  // Format dates on server side to avoid hydration mismatch
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

