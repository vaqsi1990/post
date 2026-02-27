import AdminShell from '../components/AdminShell';
import ChatAdmin from './ChatAdmin';

export default async function AdminChatPage() {
  return (
    <AdminShell
      title="ჩეთი"
      description="გარე ეკრანიდან მოსული შეტყობინებები და პასუხები."
    >
      <ChatAdmin />
    </AdminShell>
  );
}

