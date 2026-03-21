'use client';

import { Fragment, useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { formatDateDMY, formatDateTimeDMY } from '@/lib/formatDate';

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  address?: string | null;
  role: string;
  createdAt: string; // Formatted date string from server
  roomNumber?: string | null;
};

type UserDetails = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    phoneVerified: boolean;
    personalIdNumber: string;
    city: string | null;
    address: string | null;
    balance: number;
    roomNumber: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  addresses: Array<{
    id: string;
    type: string;
    country: string;
    city: string;
    street: string;
    building: string | null;
    apartment: string | null;
    postalCode: string | null;
    isDefault: boolean;
    createdAt: string;
  }>;
  parcels: Array<{
    id: string;
    trackingNumber: string;
    status: string;
    price: number;
    shippingAmount: number | null;
    currency: string;
    weight: number | null;
    originCountry: string | null;
    createdAt: string;
  }>;
  parcelsCount: number;
};

type UsersTableProps = {
  users: User[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'მოლოდინში',
  in_transit: 'გზაში',
  arrived: 'ჩამოსული',
  region: 'რეგიონი',
  delivered: 'გატანილი',
  cancelled: 'გაუქმებული',
};

const PAGE_SIZE = 12;

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [detailsById, setDetailsById] = useState<Record<string, UserDetails>>({});
  const [emailQuery, setEmailQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [roomQuery, setRoomQuery] = useState('');
  const [page, setPage] = useState(1);

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
          createdAt: formatDateDMY(user.createdAt),
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
    // ერთხელ ჩავიტვირთოთ მომხმარებლები კლიენტზე მOUNT-ისას
    void fetchUsers(true);
  }, []);

  useEffect(() => {
    // when filters change, reset paging and collapse details
    setPage(1);
    setExpandedUserId(null);
  }, [emailQuery, nameQuery, roomQuery]);

  const handleViewDetails = async (userId: string) => {
    setError('');
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(userId);
    if (detailsById[userId]) return;

    setDetailsLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'GET' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'დეტალების წამოღებისას მოხდა შეცდომა');
        return;
      }

      const d = data as UserDetails;
      const normalized: UserDetails = {
        ...d,
        user: {
          ...d.user,
          createdAt: formatDateTimeDMY(d.user.createdAt),
          updatedAt: formatDateTimeDMY(d.user.updatedAt),
        },
        addresses: Array.isArray(d.addresses)
          ? d.addresses.map((a) => ({
              ...a,
              createdAt: formatDateTimeDMY(a.createdAt),
            }))
          : [],
        parcels: Array.isArray(d.parcels)
          ? d.parcels.map((p) => ({
              ...p,
              createdAt: formatDateTimeDMY(p.createdAt),
            }))
          : [],
        parcelsCount: typeof d.parcelsCount === 'number' ? d.parcelsCount : 0,
      };

      setDetailsById((prev) => ({ ...prev, [userId]: normalized }));
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setDetailsLoadingId(null);
    }
  };

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
    } catch {
      setError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const email = (u.email ?? '').toLowerCase();
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim().toLowerCase();
    const address = (u.address ?? '').toLowerCase();
    const roomText = (u.roomNumber ?? '').toLowerCase();
    const roomDigits = u.roomNumber != null ? String(u.roomNumber).replace(/\D/g, '') : '';

    const emailOk = !emailQuery.trim() || email.includes(emailQuery.trim().toLowerCase());
    const nameOk = !nameQuery.trim() || name.includes(nameQuery.trim().toLowerCase());
    const roomQ = roomQuery.trim().toLowerCase();
    const roomOk =
      !roomQ ||
      address.includes(roomQ) ||
      roomText.includes(roomQ) ||
      roomDigits.includes(roomQuery.trim());

    return emailOk && nameOk && roomOk;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pagedUsers = filteredUsers.slice(startIdx, startIdx + PAGE_SIZE);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
    // collapse expanded details when changing pages
    setExpandedUserId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage]);

  return (
    <>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-[16px] text-red-800">{error}</p>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/users/new"
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-[16px] font-semibold text-black hover:bg-gray-50"
        >
          ახალი მომხმარებელი
        </Link>
      </div>

      <div className="mb-4 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">ძებნა მეილით</label>
          <input
            value={emailQuery}
            onChange={(e) => setEmailQuery(e.target.value)}
            placeholder="user@example.com"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">ძებნა სახელით</label>
          <input
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="სახელი გვარი"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">ძებნა ოთახის ნომრით</label>
          <input
            value={roomQuery}
            onChange={(e) => setRoomQuery(e.target.value)}
            placeholder="მაგ. 12 (ან PO123)"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <p className="mt-1 text-[12px] text-gray-600">ეძებს მომხმარებლის მისამართში და PO ნომერშიც.</p>
        </div>
      </div>

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
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">ელფოსტა</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">სახელი</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">PO</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">როლი</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">რეგისტრაცია</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {pagedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[16px] text-gray-600">
                  მომხმარებელი ვერ მოიძებნა.
                </td>
              </tr>
            ) : (
              pagedUsers.map((user) => {
                const isExpanded = expandedUserId === user.id;
                const d = detailsById[user.id];
                return (
                  <Fragment key={user.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-[16px] text-black">{user.email}</td>
                      <td className="px-4 py-2 text-[16px] text-black">
                        {(user.firstName || user.lastName)
                          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                          : '—'}
                      </td>
                      <td className="px-4 py-2 text-[16px] text-black">
                        {user.roomNumber != null ? user.roomNumber : '—'}
                      </td>
                      <td className="px-4 py-2 text-[16px] text-black">
                        {user.role === 'ADMIN' ? 'ადმინი' : 'მომხმარებელი'}
                      </td>
                      <td className="px-4 py-2 text-[16px] text-black">
                        {user.createdAt}
                      </td>
                      <td className="px-4 py-2 flex items-center gap-2 text-[16px]">
                        <button
                          type="button"
                          onClick={() => void handleViewDetails(user.id)}
                          disabled={detailsLoadingId === user.id || deletingId === user.id}
                          className="mr-2 rounded-md border border-gray-300 bg-white px-3 py-1 text-[16px] font-semibold text-black hover:bg-gray-50 disabled:opacity-50"
                        >
                          {detailsLoadingId === user.id
                            ? 'იტვირთება...'
                            : isExpanded
                              ? 'დახურვა'
                              : 'დეტალურად'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(user.id, user.email)}
                          disabled={deletingId === user.id}
                          className="rounded-md bg-red-600 px-3 py-1 text-[16px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === user.id ? 'წაიშლება...' : 'წაშლა'}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-4 py-4 text-black text-[14px] md:text-[18px]">
                          {!d ? (
                            <div className="text-gray-700">იტვირთება...</div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 bg-white p-3">
                                  <p className="mb-2 text-[15px] font-semibold text-black">პროფილი</p>
                                  <div className="grid grid-cols-2 gap-2 text-[14px] text-black">
                                    <span className="text-gray-600">სახელი</span>
                                    <span>
                                      {(d.user.firstName || d.user.lastName)
                                        ? `${d.user.firstName ?? ''} ${d.user.lastName ?? ''}`.trim()
                                        : '—'}
                                    </span>
                                    <span className="text-gray-600">PO</span>
                                    <span>{d.user.roomNumber}</span>
                                    <span className="text-gray-600">როლი</span>
                                    <span>{d.user.role === 'ADMIN' ? 'ადმინი' : 'მომხმარებელი'}</span>
                                    <span className="text-gray-600">ბალანსი</span>
                                    <span>{d.user.balance.toFixed(2)} GEL</span>
                                    <span className="text-gray-600">რეგისტრაცია</span>
                                    <span>{d.user.createdAt}</span>
                                    <span className="text-gray-600">განახლდა</span>
                                    <span>{d.user.updatedAt}</span>
                                  </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-3">
                                  <p className="mb-2 text-[15px] font-semibold text-black">კონტაქტი</p>
                                  <div className="grid grid-cols-2 gap-2 text-[14px] text-black">
                                    <span className="text-gray-600">ტელეფონი</span>
                                    <span>{d.user.phone || '—'}</span>
                                    <span className="text-gray-600">დადასტურებული</span>
                                    <span>{d.user.phoneVerified ? 'კი' : 'არა'}</span>
                                    <span className="text-gray-600">პირადი ნომერი</span>
                                    <span>{d.user.personalIdNumber || '—'}</span>
                                    <span className="text-gray-600">ქალაქი</span>
                                    <span>{d.user.city || '—'}</span>
                                    <span className="text-gray-600">მისამართი</span>
                                    <span>{d.user.address || '—'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl border border-gray-200 bg-white p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[15px] font-semibold text-black">მისამართები</p>
                                  <p className="text-[13px] text-gray-600">
                                    {d.addresses.length ? `${d.addresses.length} ცალი` : '—'}
                                  </p>
                                </div>
                                {d.addresses.length === 0 ? (
                                  <p className="mt-2 text-[14px] text-gray-600">მისამართები არ აქვს დამატებული.</p>
                                ) : (
                                  <div className="mt-2 space-y-2">
                                    {d.addresses.map((a) => (
                                      <div key={a.id} className="rounded-lg bg-gray-50 p-2 text-[14px] text-black">
                                        <p className="font-medium">
                                          {a.type} {a.isDefault ? '(default)' : ''}
                                        </p>
                                        <p className="text-gray-700">
                                          {a.country}, {a.city}, {a.street}
                                          {a.building ? `, ${a.building}` : ''}
                                          {a.apartment ? `, ${a.apartment}` : ''}
                                          {a.postalCode ? `, ${a.postalCode}` : ''}
                                        </p>
                                        <p className="text-[12px] text-gray-500">{a.createdAt}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="rounded-xl border border-gray-200 bg-white p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[15px] font-semibold text-black">ბოლო ამანათები</p>
                                  <p className="text-[13px] text-gray-600">სულ: {d.parcelsCount}</p>
                                </div>
                                {d.parcels.length === 0 ? (
                                  <p className="mt-2 text-[14px] text-gray-600">ამანათები არ აქვს.</p>
                                ) : (
                                  <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">თრექინგი</th>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">სტატუსი</th>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">თანხა</th>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">წონა</th>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">თარიღი</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {d.parcels.map((p) => (
                                          <tr key={p.id}>
                                            <td className="px-3 py-2 text-[13px] text-black">{p.trackingNumber}</td>
                                            <td className="px-3 py-2 text-[13px] text-black">
                                              {STATUS_LABELS[p.status] ?? p.status}
                                            </td>
                                            <td className="px-3 py-2 text-[13px] text-black">
                                              {(p.shippingAmount ?? p.price).toFixed(2)} {p.currency || 'GEL'}
                                            </td>
                                            <td className="px-3 py-2 text-[13px] text-black">
                                              {p.weight != null ? `${p.weight} kg` : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-[13px] text-black">{p.createdAt}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[14px] text-gray-700">
            ნაჩვენებია {startIdx + 1}-{Math.min(startIdx + PAGE_SIZE, filteredUsers.length)} / {filteredUsers.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[14px] font-semibold text-black hover:bg-gray-50 disabled:opacity-50"
            >
              წინა
            </button>
            <span className="text-[14px] text-gray-700">
              გვერდი {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[14px] font-semibold text-black hover:bg-gray-50 disabled:opacity-50"
            >
              შემდეგი
            </button>
          </div>
        </div>
      )}
    </>
  );
}
