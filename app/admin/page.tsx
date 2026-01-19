export default async function AdminPage() {
  const Stats = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 p-4">
        <p className="text-[16px] text-black">მომხმარებლები</p>
        <p className="mt-1 text-2xl font-bold text-black">—</p>
        <p className="mt-1 text-[16px] text-black">მალე დავამატებთ რეალურ მონაცემებს</p>
      </div>
      <div className="rounded-2xl border border-gray-200 p-4">
        <p className="text-[16px] text-black">გზაში</p>
        <p className="mt-1 text-2xl font-bold text-black">—</p>
        <p className="mt-1 text-[16px] text-black">მალე დავამატებთ რეალურ მონაცემებს</p>
      </div>
      <div className="rounded-2xl border border-gray-200 p-4">
        <p className="text-[16px] text-black">საწყობში</p>
        <p className="mt-1 text-2xl font-bold text-black">—</p>
        <p className="mt-1 text-[16px] text-black">მალე დავამატებთ რეალურ მონაცემებს</p>
      </div>
      <div className="rounded-2xl border border-gray-200 p-4">
        <p className="text-[16px] text-black">გაცემული</p>
        <p className="mt-1 text-2xl font-bold text-black">—</p>
        <p className="mt-1 text-[16px] text-black">მალე დავამატებთ რეალურ მონაცემებს</p>
      </div>
    </div>
  );

  const AdminShell = (await import('./components/AdminShell')).default;
  return (
    <AdminShell
      title="Admin Panel"
      description="მიმოხილვა"
    >
      {Stats}
    </AdminShell>
  );
}

