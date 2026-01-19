'use client';

import { useEffect, useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';

type AdminMeResponse = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
};

type FieldErrors = Partial<Record<'email' | 'firstName' | 'lastName' | 'currentPassword' | 'newPassword' | 'confirmNewPassword', string>>;
type FieldKey = keyof FieldErrors;

function isFieldKey(x: unknown): x is FieldKey {
  return (
    x === 'email' ||
    x === 'firstName' ||
    x === 'lastName' ||
    x === 'currentPassword' ||
    x === 'newPassword' ||
    x === 'confirmNewPassword'
  );
}

export default function AdminSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const dirty = useMemo(() => {
    return (
      email.trim().length > 0 ||
      firstName.trim().length > 0 ||
      lastName.trim().length > 0 ||
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmNewPassword.length > 0
    );
  }, [email, firstName, lastName, currentPassword, newPassword, confirmNewPassword]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/me', { method: 'GET' });
        if (!res.ok) throw new Error('ვერ მოხერხდა მონაცემების წამოღება');
        const data = (await res.json()) as AdminMeResponse;
        if (!mounted) return;

        setEmail(data.user.email ?? '');
        setFirstName(data.user.firstName ?? '');
        setLastName(data.user.lastName ?? '');
      } catch {
        if (!mounted) return;
        setErrorMessage('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const clearMessages = () => {
    setMessage('');
    setErrorMessage('');
  };

  const clearFieldError = (k: keyof FieldErrors) => {
    if (!fieldErrors[k]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setFieldErrors({});
    setSaving(true);

    try {
      const payload = {
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        confirmNewPassword: confirmNewPassword || undefined,
      };

      // If user didn't change email, don't send it (avoids unnecessary currentPassword requirement)
      // We still allow the server to accept it either way.
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // API returns either {field} or {details[]}
        if (data?.field && data?.error) {
          setFieldErrors({ [data.field]: data.error } as FieldErrors);
          setErrorMessage(data.error);
        } else if (Array.isArray(data?.details)) {
          const fe: FieldErrors = {};
          for (const d of data.details) {
            const key = (d as { field?: unknown })?.field;
            if (isFieldKey(key)) fe[key] = String((d as { message?: unknown })?.message ?? '');
          }
          setFieldErrors(fe);
          setErrorMessage(data.error || 'ვალიდაციის შეცდომა');
        } else {
          setErrorMessage(data?.error || 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
        }
        return;
      }

      setMessage(data?.message || 'განახლდა');

      // Clear password fields after success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      if (data?.requiresReauth) {
        // to ensure session token/email stays consistent
        setMessage('პარამეტრები განახლდა. უსაფრთხოებისთვის გთხოვთ ხელახლა შეხვიდეთ.');
        await signOut({ callbackUrl: '/login' });
      }
    } catch {
      setErrorMessage('დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-[16px] text-black">იტვირთება...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {message ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-[16px] text-green-800">{message}</p>
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-[16px] text-red-800">{errorMessage}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[16px] font-medium text-black mb-1" htmlFor="firstName">
            სახელი
          </label>
          <input
            id="firstName"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clearFieldError('firstName');
              clearMessages();
            }}
            className={`w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black ${
              fieldErrors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {fieldErrors.firstName ? <p className="mt-1 text-[16px] text-red-600">{fieldErrors.firstName}</p> : null}
        </div>

        <div>
          <label className="block text-[16px] font-medium text-black mb-1" htmlFor="lastName">
            გვარი
          </label>
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clearFieldError('lastName');
              clearMessages();
            }}
            className={`w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black ${
              fieldErrors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {fieldErrors.lastName ? <p className="mt-1 text-[16px] text-red-600">{fieldErrors.lastName}</p> : null}
        </div>
      </div>

      <div>
        <label className="block text-[16px] font-medium text-black mb-1" htmlFor="email">
          ელფოსტა
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError('email');
            clearMessages();
          }}
          className={`w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black ${
            fieldErrors.email ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {fieldErrors.email ? <p className="mt-1 text-[16px] text-red-600">{fieldErrors.email}</p> : null}
        <p className="mt-1 text-[16px] text-black">ელფოსტის შეცვლისთვის საჭიროა მიმდინარე პაროლი.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4">
        <p className="text-[16px] font-semibold text-black">პაროლის შეცვლა</p>
        <p className="mt-1 text-[16px] text-black">თუ პაროლს ცვლი, შეავსე ყველა ქვედა ველი.</p>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[16px] font-medium text-black mb-1" htmlFor="currentPassword">
              მიმდინარე პაროლი
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                clearFieldError('currentPassword');
                clearMessages();
              }}
              className={`w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black ${
                fieldErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {fieldErrors.currentPassword ? (
              <p className="mt-1 text-[16px] text-red-600">{fieldErrors.currentPassword}</p>
            ) : null}
          </div>

          <div />

          <div>
            <label className="block text-[16px] font-medium text-black mb-1" htmlFor="newPassword">
              ახალი პაროლი
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                clearFieldError('newPassword');
                clearMessages();
              }}
              className={`w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black ${
                fieldErrors.newPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {fieldErrors.newPassword ? <p className="mt-1 text-[16px] text-red-600">{fieldErrors.newPassword}</p> : null}
          </div>

          <div>
            <label className="block text-[16px] font-medium text-black mb-1" htmlFor="confirmNewPassword">
              გაიმეორეთ ახალი პაროლი
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
                clearFieldError('confirmNewPassword');
                clearMessages();
              }}
              className={`w-full rounded-md border px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black ${
                fieldErrors.confirmNewPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {fieldErrors.confirmNewPassword ? (
              <p className="mt-1 text-[16px] text-red-600">{fieldErrors.confirmNewPassword}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving || !dirty}
          className="rounded-md bg-black px-4 py-2 text-[16px] font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'ინახება...' : 'შენახვა'}
        </button>
      </div>
    </form>
  );
}

