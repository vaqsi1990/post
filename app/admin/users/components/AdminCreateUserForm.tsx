'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import type { AdminCreateUserInput } from '@/lib/validations';
import { useLocale } from 'next-intl';

const initialForm: AdminCreateUserInput & { confirmPassword: string } = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
  personalIdNumber: '',
  city: '',
  address: '',
  postalIndex: '',
  role: 'USER',
};

export default function AdminCreateUserForm({
  postUrl = '/api/admin/users',
  successRedirect = '/admin/users',
}: {
  postUrl?: string;
  successRedirect?: string;
}) {
  const locale = useLocale();
  const isEn = locale === 'en';
  const isRu = locale === 'ru';
  const t = {
    passwordsMismatch: isRu ? 'Пароли не совпадают' : isEn ? 'Passwords do not match' : 'პაროლები არ ემთხვევა',
    createUserError: isRu ? 'Ошибка при добавлении пользователя' : isEn ? 'Failed to add user' : 'მომხმარებლის დამატებისას მოხდა შეცდომა',
    genericError: isRu ? 'Произошла ошибка. Пожалуйста, попробуйте снова.' : isEn ? 'An error occurred. Please try again.' : 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.',
    email: isRu ? 'Эл. почта *' : isEn ? 'Email *' : 'ელ-ფოსტა *',
    password: isRu ? 'Пароль *' : isEn ? 'Password *' : 'პაროლი *',
    confirmPassword: isRu ? 'Подтвердите пароль *' : isEn ? 'Confirm password *' : 'პაროლის დამოწმება *',
    firstName: isRu ? 'Имя' : isEn ? 'First name' : 'სახელი',
    lastName: isRu ? 'Фамилия' : isEn ? 'Last name' : 'გვარი',
    phone: isRu ? 'Телефон' : isEn ? 'Phone' : 'ტელეფონი',
    personalId: isRu ? 'Личный номер *' : isEn ? 'Personal ID *' : 'პირადი ნომერი *',
    personalIdPlaceholder: isRu ? '11 цифр' : isEn ? '11 digits' : '11 ციფრი',
    city: isRu ? 'Город' : isEn ? 'City' : 'ქალაქი',
    postalIndex: isRu ? 'Почтовый индекс' : isEn ? 'Postal index' : 'ინდექსის ნომერი',
    postalIndexHint: isRu ? '4 цифры (необязательно)' : isEn ? '4 digits (optional)' : '4 ციფრი (არასავალდებულო)',
    address: isRu ? 'Адрес' : isEn ? 'Address' : 'მისამართი',
    role: isRu ? 'Роль' : isEn ? 'Role' : 'როლი',
    user: isRu ? 'Пользователь' : isEn ? 'User' : 'მომხმარებელი',
    admin: isRu ? 'Админ' : isEn ? 'Admin' : 'ადმინი',
    creating: isRu ? 'Создание...' : isEn ? 'Creating...' : 'იქმნება...',
    register: isRu ? 'Регистрация' : isEn ? 'Register' : 'რეგისტრაცია',
    cancel: isRu ? 'Отмена' : isEn ? 'Cancel' : 'გაუქმება',
  } as const;

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');
    if (form.password !== form.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: t.passwordsMismatch }));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName?.trim() || undefined,
          lastName: form.lastName?.trim() || undefined,
          phone: form.phone?.trim() || undefined,
          personalIdNumber: form.personalIdNumber,
          city: form.city?.trim() || undefined,
          address: form.address?.trim() || undefined,
          postalIndex: form.postalIndex?.trim() || undefined,
          role: form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: { path?: string[]; message: string }) => {
            const key = err.path?.[0];
            if (key) fieldErrors[key] = err.message;
          });
          setErrors(fieldErrors);
        }
        setSubmitError(data.error || t.createUserError);
        return;
      }
      router.push(successRedirect);
      return;
    } catch {
      setSubmitError(t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      {submitError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-[16px] text-red-800">{submitError}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{t.email}</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.email && <p className="mt-1 text-[16px] text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{t.password}</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.password && <p className="mt-1 text-[16px] text-red-600">{errors.password}</p>}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{t.confirmPassword}</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.confirmPassword && <p className="mt-1 text-[16px] text-red-600">{errors.confirmPassword}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="w-full md:w-[calc(50%-0.375rem)]">
            <label className="mb-1 block text-[14px] font-semibold text-black">{t.firstName}</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="w-full md:w-[calc(50%-0.375rem)]">
            <label className="mb-1 block text-[14px] font-semibold text-black">{t.lastName}</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{t.phone}</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="5XXXXXXXX"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.phone && <p className="mt-1 text-[16px] text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{t.personalId}</label>
          <input
            type="text"
            name="personalIdNumber"
            value={form.personalIdNumber}
            onChange={handleChange}
            required
            maxLength={11}
            placeholder={t.personalIdPlaceholder}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.personalIdNumber && <p className="mt-1 text-[16px] text-red-600">{errors.personalIdNumber}</p>}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{t.city}</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{t.postalIndex}</label>
          <p className="mb-1 text-[12px] text-gray-600">{t.postalIndexHint}</p>
          <input
            type="text"
            name="postalIndex"
            inputMode="numeric"
            maxLength={4}
            value={form.postalIndex}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
              setForm((prev) => ({ ...prev, postalIndex: v }));
              if (errors.postalIndex) setErrors((prev) => ({ ...prev, postalIndex: '' }));
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black tabular-nums focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="0108"
          />
          {errors.postalIndex && <p className="mt-1 text-[16px] text-red-600">{errors.postalIndex}</p>}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{t.address}</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">{t.role}</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="USER">{t.user}</option>
            <option value="ADMIN">{t.admin}</option>
          </select>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-black px-4 py-2 text-[15px] font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? t.creating : t.register}
          </button>
          <Link
            href="/admin/users"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-[15px] font-semibold text-black hover:bg-gray-50"
          >
            {t.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
