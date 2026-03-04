import AdminShell from '../../components/AdminShell';
import AdminCreateParcelForm from '../../components/AdminCreateParcelForm';

export const dynamic = 'force-dynamic';

export default function AdminIncomingNewPage() {
  return (
    <AdminShell
      title="ახალი შემოსული ამანათი"
      description="შეავსეთ ფორმა ახალი შემოსული ამანათის დასამატებლად."
    >
      <AdminCreateParcelForm />
    </AdminShell>
  );
}

