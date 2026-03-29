'use client';

import { Fragment, useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { formatDateDMY, formatDateTimeDMY } from '@/lib/formatDate';
import { useLocale } from 'next-intl';

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  address?: string | null;
  role: string;
  employeeCountry?: string | null;
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
    postalIndex: string | null;
    balance: number;
    roomNumber: string;
    role: string;
    employeeCountry?: string | null;
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

const ROLE_OPTIONS = ['USER', 'EMPLOYEE', 'ADMIN'] as const;

const COUNTRY_OPTIONS = ['GB', 'US', 'CN', 'IT', 'GR', 'ES', 'FR', 'DE', 'TR'] as const;

const PAGE_SIZE = 12;

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const locale = useLocale();
  const isEn = locale === 'en';
  const isRu = locale === 'ru';
  const text = {
    detailsFetchError: isRu ? 'Ошибка при загрузке деталей' : isEn ? 'Failed to load details' : 'დეტალების წამოღებისას მოხდა შეცდომა',
    genericError: isRu ? 'Произошла ошибка. Пожалуйста, попробуйте снова.' : isEn ? 'An error occurred. Please try again.' : 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.',
    deleteConfirm: isRu ? 'Вы уверены, что хотите удалить пользователя:' : isEn ? 'Are you sure you want to delete user:' : 'დარწმუნებული ხართ, რომ გსურთ მომხმარებლის წაშლა:',
    deleteError: isRu ? 'Ошибка при удалении' : isEn ? 'Failed to delete user' : 'წაშლისას მოხდა შეცდომა',
    employeeCountryRequired: isRu ? 'Для сотрудника выберите страну' : isEn ? 'Select country for employee' : 'თანამშრომლისთვის აირჩიეთ ქვეყანა',
    roleChangeError: isRu ? 'Ошибка при изменении роли' : isEn ? 'Failed to change role' : 'როლის შეცვლისას მოხდა შეცდომა',
    newUser: isRu ? 'Новый пользователь' : isEn ? 'New user' : 'ახალი მომხმარებელი',
    searchByEmail: isRu ? 'Поиск по email' : isEn ? 'Search by email' : 'ძებნა მეილით',
    searchByName: isRu ? 'Поиск по имени' : isEn ? 'Search by name' : 'ძებნა სახელით',
    searchByRoom: isRu ? 'Поиск по номеру комнаты' : isEn ? 'Search by room number' : 'ძებნა ოთახის ნომრით',
    namePlaceholder: isRu ? 'Имя Фамилия' : isEn ? 'First Last' : 'სახელი გვარი',
    roomPlaceholder: isRu ? 'напр. 12 (или PO123)' : isEn ? 'e.g. 12 (or PO123)' : 'მაგ. 12 (ან PO123)',
    roomHint: isRu ? 'Ищет также по адресу пользователя и PO номеру.' : isEn ? 'Also searches in user address and PO number.' : 'ეძებს მომხმარებლის მისამართში და PO ნომერშიც.',
    loading: isRu ? 'Загрузка...' : isEn ? 'Loading...' : 'იტვირთება...',
    email: isRu ? 'Эл. почта' : isEn ? 'Email' : 'ელ-ფოსტა',
    name: isRu ? 'Имя' : isEn ? 'Name' : 'სახელი',
    role: isRu ? 'Роль' : isEn ? 'Role' : 'როლი',
    registration: isRu ? 'Регистрация' : isEn ? 'Registered' : 'რეგისტრაცია',
    action: isRu ? 'Действие' : isEn ? 'Action' : 'მოქმედება',
    notFound: isRu ? 'Пользователь не найден.' : isEn ? 'User not found.' : 'მომხმარებელი ვერ მოიძებნა.',
    close: isRu ? 'Закрыть' : isEn ? 'Close' : 'დახურვა',
    details: isRu ? 'Подробнее' : isEn ? 'Details' : 'დეტალურად',
    deleting: isRu ? 'Удаление...' : isEn ? 'Deleting...' : 'წაიშლება...',
    delete: isRu ? 'Удалить' : isEn ? 'Delete' : 'წაშლა',
    profile: isRu ? 'Профиль' : isEn ? 'Profile' : 'პროფილი',
    employeeCountry: isRu ? 'Страна (сотрудник)' : isEn ? 'Country (employee)' : 'ქვეყანა (თანამშრომელი)',
    balance: isRu ? 'Баланс' : isEn ? 'Balance' : 'ბალანსი',
    updated: isRu ? 'Обновлено' : isEn ? 'Updated' : 'განახლდა',
    selectCountry: isRu ? 'Выберите страну' : isEn ? 'Select country' : 'აირჩიე ქვეყანა',
    saving: isRu ? 'Сохранение...' : isEn ? 'Saving...' : 'ინახება...',
    changeRole: isRu ? 'Изменить роль' : isEn ? 'Change role' : 'როლის შეცვლა',
    contact: isRu ? 'Контакт' : isEn ? 'Contact' : 'კონტაქტი',
    phone: isRu ? 'Телефон' : isEn ? 'Phone' : 'ტელეფონი',
    verified: isRu ? 'Подтвержден' : isEn ? 'Verified' : 'დადასტურებული',
    yes: isRu ? 'Да' : isEn ? 'Yes' : 'კი',
    no: isRu ? 'Нет' : isEn ? 'No' : 'არა',
    personalId: isRu ? 'Личный номер' : isEn ? 'Personal ID' : 'პირადი ნომერი',
    postalIndex: isRu ? 'Почтовый индекс' : isEn ? 'Postal index' : 'ინდექსის ნომერი',
    city: isRu ? 'Город' : isEn ? 'City' : 'ქალაქი',
    address: isRu ? 'Адрес' : isEn ? 'Address' : 'მისამართი',
    addresses: isRu ? 'Адреса' : isEn ? 'Addresses' : 'მისამართები',
    count: isRu ? 'шт.' : isEn ? 'items' : 'ცალი',
    noAddresses: isRu ? 'Адреса не добавлены.' : isEn ? 'No addresses added.' : 'მისამართები არ აქვს დამატებული.',
    lastParcels: isRu ? 'Последние посылки' : isEn ? 'Recent parcels' : 'ბოლო ამანათები',
    total: isRu ? 'Всего' : isEn ? 'Total' : 'სულ',
    noParcels: isRu ? 'Посылок нет.' : isEn ? 'No parcels.' : 'ამანათები არ აქვს.',
    tracking: isRu ? 'Трекинг' : isEn ? 'Tracking' : 'თრექინგი',
    status: isRu ? 'Статус' : isEn ? 'Status' : 'სტატუსი',
    amount: isRu ? 'Сумма' : isEn ? 'Amount' : 'თანხა',
    weight: isRu ? 'Вес' : isEn ? 'Weight' : 'წონა',
    date: isRu ? 'Дата' : isEn ? 'Date' : 'თარიღი',
    showing: isRu ? 'Показано' : isEn ? 'Showing' : 'ნაჩვენებია',
    prev: isRu ? 'Назад' : isEn ? 'Prev' : 'წინა',
    page: isRu ? 'Страница' : isEn ? 'Page' : 'გვერდი',
    next: isRu ? 'Далее' : isEn ? 'Next' : 'შემდეგი',
  } as const;

  const roleLabels = {
    USER: isRu ? 'Пользователь' : isEn ? 'User' : 'მომხმარებელი',
    EMPLOYEE: isRu ? 'Сотрудник' : isEn ? 'Employee' : 'თანამშრომელი',
    ADMIN: isRu ? 'Админ' : isEn ? 'Admin' : 'ადმინი',
  } as const;
  const countryLabels: Record<(typeof COUNTRY_OPTIONS)[number], string> = {
    GB: isRu ? 'Великобритания' : isEn ? 'United Kingdom' : 'დიდი ბრიტანეთი',
    US: isRu ? 'США' : isEn ? 'USA' : 'აშშ',
    CN: isRu ? 'Китай' : isEn ? 'China' : 'ჩინეთი',
    IT: isRu ? 'Италия' : isEn ? 'Italy' : 'იტალია',
    GR: isRu ? 'Греция' : isEn ? 'Greece' : 'საბერძნეთი',
    ES: isRu ? 'Испания' : isEn ? 'Spain' : 'ესპანეთი',
    FR: isRu ? 'Франция' : isEn ? 'France' : 'საფრანგეთი',
    DE: isRu ? 'Германия' : isEn ? 'Germany' : 'გერმანია',
    TR: isRu ? 'Турция' : isEn ? 'Turkey' : 'თურქეთი',
  };
  const statusLabels: Record<string, string> = {
    pending: isRu ? 'В ожидании' : isEn ? 'Pending' : 'მოლოდინში',
    in_transit: isRu ? 'В пути' : isEn ? 'In transit' : 'გზაში',
    arrived: isRu ? 'Прибыла' : isEn ? 'Arrived' : 'ჩამოსული',
    region: isRu ? 'Регион' : isEn ? 'Region' : 'რეგიონი',
    delivered: isRu ? 'Доставлена' : isEn ? 'Delivered' : 'გატანილი',
    cancelled: isRu ? 'Отменена' : isEn ? 'Cancelled' : 'გაუქმებული',
  };

  const [users, setUsers] = useState(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [pendingRoleById, setPendingRoleById] = useState<Record<string, string>>({});
  const [pendingCountryById, setPendingCountryById] = useState<Record<string, string>>({});
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
        setPendingCountryById((prev) => {
          const next = { ...prev };
          for (const user of formattedUsers) {
            if (user.employeeCountry) {
              next[user.id] = user.employeeCountry;
            }
          }
          return next;
        });
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
        setError(data.error || text.detailsFetchError);
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
      if (normalized.user.employeeCountry) {
        setPendingCountryById((prev) => ({ ...prev, [userId]: normalized.user.employeeCountry as string }));
      }
    } catch {
      setError(text.genericError);
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`${text.deleteConfirm} ${userEmail}?`)) {
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
        setError(data.error || text.deleteError);
        return;
      }

      // Remove user from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      setError(text.genericError);
    } finally {
      setDeletingId(null);
    }
  };

  const handleChangeRole = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const nextRole = pendingRoleById[userId] ?? user.role;
    const nextCountry = pendingCountryById[userId] ?? user.employeeCountry ?? '';
    const roleChanged = nextRole !== user.role;
    const countryChanged =
      nextRole === 'EMPLOYEE' && nextCountry !== (user.employeeCountry ?? '');
    if (!roleChanged && !countryChanged) return;
    if (nextRole === 'EMPLOYEE' && !nextCountry) {
      setError(text.employeeCountryRequired);
      return;
    }

    setUpdatingRoleId(userId);
    setError('');

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: nextRole,
          employeeCountry: nextRole === 'EMPLOYEE' ? nextCountry : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || text.roleChangeError);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: nextRole,
                employeeCountry: nextRole === 'EMPLOYEE' ? nextCountry : null,
              }
            : u
        )
      );
      setDetailsById((prev) => {
        const detail = prev[userId];
        if (!detail) return prev;
        return {
          ...prev,
          [userId]: {
            ...detail,
            user: {
              ...detail.user,
              role: nextRole,
              employeeCountry: nextRole === 'EMPLOYEE' ? nextCountry : null,
            },
          },
        };
      });
      setPendingRoleById((prev) => ({ ...prev, [userId]: nextRole }));
      setPendingCountryById((prev) => ({ ...prev, [userId]: nextCountry }));
    } catch {
      setError(text.genericError);
    } finally {
      setUpdatingRoleId(null);
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
          {text.newUser}
        </Link>
      </div>

      <div className="mb-4 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{text.searchByEmail}</label>
          <input
            value={emailQuery}
            onChange={(e) => setEmailQuery(e.target.value)}
            placeholder="user@example.com"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{text.searchByName}</label>
          <input
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder={text.namePlaceholder}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{text.searchByRoom}</label>
          <input
            value={roomQuery}
            onChange={(e) => setRoomQuery(e.target.value)}
            placeholder={text.roomPlaceholder}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <p className="mt-1 text-[12px] text-gray-600">{text.roomHint}</p>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-gray-200">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75 rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
              <p className="text-[16px] text-gray-600">{text.loading}</p>
            </div>
          </div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">{text.email}</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">{text.name}</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">PO</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">{text.role}</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">{text.registration}</th>
              <th className="px-4 py-2 text-left text-[16px] md:text-[18px] font-semibold text-black">{text.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {pagedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[16px] text-gray-600">
                  {text.notFound}
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
                        {roleLabels[(user.role as keyof typeof roleLabels)] ?? user.role}
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
                            ? text.loading
                            : isExpanded
                              ? text.close
                              : text.details}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(user.id, user.email)}
                          disabled={deletingId === user.id || updatingRoleId === user.id}
                          className="rounded-md bg-red-600 px-3 py-1 text-[16px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === user.id ? text.deleting : text.delete}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-4 py-4 text-black text-[14px] md:text-[18px]">
                          {!d ? (
                            <div className="text-gray-700">{text.loading}</div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 bg-white p-3">
                                  <p className="mb-2 text-[15px] font-semibold text-black">{text.profile}</p>
                                  <div className="grid grid-cols-2 gap-2 text-[14px] text-black">
                                    <span className="text-gray-600">{text.name}</span>
                                    <span>
                                      {(d.user.firstName || d.user.lastName)
                                        ? `${d.user.firstName ?? ''} ${d.user.lastName ?? ''}`.trim()
                                        : '—'}
                                    </span>
                                    <span className="text-gray-600">PO</span>
                                    <span>{d.user.roomNumber}</span>
                                    <span className="text-gray-600">{text.role}</span>
                                    <span>
                                      {roleLabels[(d.user.role as keyof typeof roleLabels)] ?? d.user.role}
                                    </span>
                                    <span className="text-gray-600">{text.employeeCountry}</span>
                                    <span>
                                      {d.user.employeeCountry
                                        ? (countryLabels[
                                            d.user.employeeCountry as keyof typeof countryLabels
                                          ] ?? d.user.employeeCountry)
                                        : '—'}
                                    </span>
                                    <span className="text-gray-600">{text.balance}</span>
                                    <span>{d.user.balance.toFixed(2)} GEL</span>
                                    <span className="text-gray-600">{text.registration}</span>
                                    <span>{d.user.createdAt}</span>
                                    <span className="text-gray-600">{text.updated}</span>
                                    <span>{d.user.updatedAt}</span>
                                  </div>
                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <select
                                      value={pendingRoleById[user.id] ?? user.role}
                                      onChange={(e) =>
                                        setPendingRoleById((prev) => ({ ...prev, [user.id]: e.target.value }))
                                      }
                                      disabled={updatingRoleId === user.id || deletingId === user.id}
                                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[14px] text-black disabled:opacity-50"
                                    >
                                      {ROLE_OPTIONS.map((role) => (
                                        <option key={role} value={role}>
                                          {roleLabels[role]}
                                        </option>
                                      ))}
                                    </select>
                                    {(pendingRoleById[user.id] ?? user.role) === 'EMPLOYEE' && (
                                      <select
                                        value={pendingCountryById[user.id] ?? user.employeeCountry ?? ''}
                                        onChange={(e) =>
                                          setPendingCountryById((prev) => ({
                                            ...prev,
                                            [user.id]: e.target.value,
                                          }))
                                        }
                                        disabled={updatingRoleId === user.id || deletingId === user.id}
                                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[14px] text-black disabled:opacity-50"
                                      >
                                        <option value="">{text.selectCountry}</option>
                                        {COUNTRY_OPTIONS.map((country) => (
                                          <option key={country} value={country}>
                                            {countryLabels[country]}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => void handleChangeRole(user.id)}
                                      disabled={
                                        updatingRoleId === user.id ||
                                        deletingId === user.id ||
                                        ((pendingRoleById[user.id] ?? user.role) === user.role &&
                                          ((pendingRoleById[user.id] ?? user.role) !== 'EMPLOYEE' ||
                                            (pendingCountryById[user.id] ?? user.employeeCountry ?? '') ===
                                              (user.employeeCountry ?? ''))) ||
                                        ((pendingRoleById[user.id] ?? user.role) === 'EMPLOYEE' &&
                                          !(pendingCountryById[user.id] ?? user.employeeCountry))
                                      }
                                      className="rounded-md bg-blue-600 px-3 py-1 text-[14px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      {updatingRoleId === user.id ? text.saving : text.changeRole}
                                    </button>
                                  </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-3">
                                  <p className="mb-2 text-[15px] font-semibold text-black">{text.contact}</p>
                                  <div className="grid grid-cols-2 gap-2 text-[14px] text-black">
                                    <span className="text-gray-600">{text.phone}</span>
                                    <span>{d.user.phone || '—'}</span>
                                    <span className="text-gray-600">{text.verified}</span>
                                    <span>{d.user.phoneVerified ? text.yes : text.no}</span>
                                    <span className="text-gray-600">{text.personalId}</span>
                                    <span>{d.user.personalIdNumber || '—'}</span>
                                    <span className="text-gray-600">{text.postalIndex}</span>
                                    <span>{d.user.postalIndex || '—'}</span>
                                    <span className="text-gray-600">{text.city}</span>
                                    <span>{d.user.city || '—'}</span>
                                    <span className="text-gray-600">{text.address}</span>
                                    <span>{d.user.address || '—'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl border border-gray-200 bg-white p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[15px] font-semibold text-black">{text.addresses}</p>
                                  <p className="text-[13px] text-gray-600">
                                    {d.addresses.length ? `${d.addresses.length} ${text.count}` : '—'}
                                  </p>
                                </div>
                                {d.addresses.length === 0 ? (
                                  <p className="mt-2 text-[14px] text-gray-600">{text.noAddresses}</p>
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
                                  <p className="text-[15px] font-semibold text-black">{text.lastParcels}</p>
                                  <p className="text-[13px] text-gray-600">{text.total}: {d.parcelsCount}</p>
                                </div>
                                {d.parcels.length === 0 ? (
                                  <p className="mt-2 text-[14px] text-gray-600">{text.noParcels}</p>
                                ) : (
                                  <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">{text.tracking}</th>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">{text.status}</th>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">{text.amount}</th>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">{text.weight}</th>
                                          <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">{text.date}</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {d.parcels.map((p) => (
                                          <tr key={p.id}>
                                            <td className="px-3 py-2 text-[13px] text-black">{p.trackingNumber}</td>
                                            <td className="px-3 py-2 text-[13px] text-black">
                                              {statusLabels[p.status] ?? p.status}
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
            {text.showing} {startIdx + 1}-{Math.min(startIdx + PAGE_SIZE, filteredUsers.length)} / {filteredUsers.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[14px] font-semibold text-black hover:bg-gray-50 disabled:opacity-50"
            >
              {text.prev}
            </button>
            <span className="text-[14px] text-gray-700">
              {text.page} {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[14px] font-semibold text-black hover:bg-gray-50 disabled:opacity-50"
            >
              {text.next}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
