'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import type { AdminCreateUserInput } from '@/lib/validations';

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
  role: 'USER',
};

export default function AdminCreateUserForm() {
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
      setErrors((prev) => ({ ...prev, confirmPassword: 'პაროლები არ ემთხვევა' }));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
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
        setSubmitError(data.error || 'მომხმარებლის დამატებისას მოხდა შეცდომა');
        return;
      }
      router.push('/admin/users');
      return;
    } catch {
      setSubmitError('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
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
          <label className="mb-1 block text-[14px] font-semibold text-black">ელფოსტა *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.email && <p className="mt-1 text-[13px] text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">პაროლი *</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.password && <p className="mt-1 text-[13px] text-red-600">{errors.password}</p>}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">პაროლის დამოწმება *</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.confirmPassword && <p className="mt-1 text-[13px] text-red-600">{errors.confirmPassword}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[14px] font-semibold text-black">სახელი</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-[14px] font-semibold text-black">გვარი</label>
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
          <label className="mb-1 block text-[14px] font-semibold text-black">ტელეფონი</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="5XXXXXXXX"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.phone && <p className="mt-1 text-[13px] text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">პირადი ნომერი *</label>
          <input
            type="text"
            name="personalIdNumber"
            value={form.personalIdNumber}
            onChange={handleChange}
            required
            maxLength={11}
            placeholder="11 ციფრი"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {errors.personalIdNumber && <p className="mt-1 text-[13px] text-red-600">{errors.personalIdNumber}</p>}
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">ქალაქი</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">მისამართი</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-[14px] font-semibold text-black">როლი</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="USER">მომხმარებელი</option>
            <option value="ADMIN">ადმინი</option>
          </select>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-black px-4 py-2 text-[15px] font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'იქმნება...' : 'რეგისტრაცია'}
          </button>
          <Link
            href="/admin/users"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-[15px] font-semibold text-black hover:bg-gray-50"
          >
            გაუქმება
          </Link>
        </div>
      </form>
    </div>
  );
}
