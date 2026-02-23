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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

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
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  clearFieldError('currentPassword');
                  clearMessages();
                }}
                className={`w-full rounded-md border px-3 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-black ${
                  fieldErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-black"
                aria-label={showCurrentPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
              >
                {showCurrentPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.currentPassword ? (
              <p className="mt-1 text-[16px] text-red-600">{fieldErrors.currentPassword}</p>
            ) : null}
          </div>

          <div />

          <div>
            <label className="block text-[16px] font-medium text-black mb-1" htmlFor="newPassword">
              ახალი პაროლი
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearFieldError('newPassword');
                  clearMessages();
                }}
                className={`w-full rounded-md border px-3 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-black ${
                  fieldErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-black"
                aria-label={showNewPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
              >
                {showNewPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.newPassword ? <p className="mt-1 text-[16px] text-red-600">{fieldErrors.newPassword}</p> : null}
          </div>

          <div>
            <label className="block text-[16px] font-medium text-black mb-1" htmlFor="confirmNewPassword">
              გაიმეორეთ ახალი პაროლი
            </label>
            <div className="relative">
              <input
                id="confirmNewPassword"
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  clearFieldError('confirmNewPassword');
                  clearMessages();
                }}
                className={`w-full rounded-md border px-3 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-black ${
                  fieldErrors.confirmNewPassword ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-black"
                aria-label={showConfirmNewPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
              >
                {showConfirmNewPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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

