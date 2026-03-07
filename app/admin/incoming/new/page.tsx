import AdminShell from '../../components/AdminShell';
import AdminCreateParcelForm from '../../components/AdminCreateParcelForm';

export const dynamic = 'force-dynamic';

export default function AdminIncomingNewPage() {
  return (
    <AdminShell
      title="ამანათის დამატება"
      description=""
    >
      <AdminCreateParcelForm />
    </AdminShell>
  );
}

