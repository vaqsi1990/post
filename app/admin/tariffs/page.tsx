import AdminShell from '../components/AdminShell';
import TariffsManager from './tariffsManager';

export default async function AdminTariffsPage() {
  return (
    <AdminShell
      title="ტარიფები"
      description="აქ შეგიძლია შეცვალო კგ-ის დიაპაზონი და 1 კგ-ის ფასი (pricePerKg)."
    >
      <TariffsManager />
    </AdminShell>
  );
}

