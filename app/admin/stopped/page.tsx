import { redirect } from 'next/navigation';

export default async function AdminStoppedPage() {
  redirect('/admin/incoming');
}

