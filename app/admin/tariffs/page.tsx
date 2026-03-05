import AdminShell from '../components/AdminShell';
import TariffsManager from './tariffsManager';

export default async function AdminTariffsPage() {
  return (
    <AdminShell
      title="ტარიფები"
      description="ქვეყნების ჩამონათვალი და 1 კგ ფასის დაყენება."
    >
      <TariffsManager />
    </AdminShell>
  );
}

