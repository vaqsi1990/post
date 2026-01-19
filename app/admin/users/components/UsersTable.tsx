'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string; // Formatted date string from server
};

type UsersTableProps = {
  users: User[];
};

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) return;
      const data = await res.json();
      if (data.users) {
        // Format dates on client side
        const formattedUsers = data.users.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt).toLocaleDateString('ka-GE'),
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Fetch users immediately when component mounts (without loading on initial mount)
    fetchUsers(!isInitialMount.current);
    isInitialMount.current = false;

    // Set up polling every 5 seconds, but only when page is visible
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          fetchUsers(true);
        }
      }, 5000);
    };

    startPolling();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        fetchUsers(true); // Fetch immediately when page becomes visible
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup interval and event listener on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
      <div className="relative overflow-x-auto rounded-2xl border border-gray-200">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75 rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
              <p className="text-[16px] text-gray-600">იტვირთება...</p>
            </div>
          </div>
        )}
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
                    {user.createdAt}
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
