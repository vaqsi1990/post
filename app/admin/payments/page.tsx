import AdminShell from '../components/AdminShell';
import PaymentsTable from './paymentsTable';

export default async function AdminPaymentsPage() {
  return (
    <AdminShell
      title="გადახდები"
      description="აქ ჩანს მომხმარებლების გადახდების ისტორია."
    >
      <PaymentsTable />
    </AdminShell>
  );
}

