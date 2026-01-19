'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: Date;
};

type UsersTableProps = {
  users: User[];
};

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`დარწმუნებული ხართ, რომ გსურთ მომხმარებლის წაშლა: ${userEmail}?`)) {
      return;
    }

    setDeletingId(userId);
    setError('');

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'წაშლისას მოხდა შეცდომა');
        return;
      }

      // Remove user from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      router.refresh();
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-[16px] text-red-800">{error}</p>
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">ელფოსტა</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">სახელი</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">როლი</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">რეგისტრაცია</th>
              <th className="px-4 py-2 text-left text-[16px] font-semibold text-gray-700">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[16px] text-gray-600">
                  ჯერ არცერთი მომხმარებელი არ არის.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-[16px] text-black">{user.email}</td>
                  <td className="px-4 py-2 text-[16px] text-black">
                    {(user.firstName || user.lastName)
                      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                      : '—'}
                  </td>
                  <td className="px-4 py-2 text-[16px] text-black">
                    {user.role === 'ADMIN' ? 'ადმინი' : 'მომხმარებელი'}
                  </td>
                  <td className="px-4 py-2 text-[16px] text-black">
                    {new Date(user.createdAt).toLocaleDateString('ka-GE')}
                  </td>
                  <td className="px-4 py-2 text-[16px]">
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={deletingId === user.id}
                      className="rounded-md bg-red-600 px-3 py-1 text-[16px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === user.id ? 'წაიშლება...' : 'წაშლა'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
