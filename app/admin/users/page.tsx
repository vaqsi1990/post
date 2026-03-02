import AdminShell from '../components/AdminShell';
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
      role: true,
      createdAt: true,
      poNumber: true,
    },
  });

  // Format dates on server side to avoid hydration mismatch
  const formattedUsers = users.map((user) => ({
    ...user,
    createdAt: new Date(user.createdAt).toLocaleDateString('ka-GE'),
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

