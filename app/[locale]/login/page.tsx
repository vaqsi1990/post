'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { loginSchema } from '../../../lib/validations';
import type { LoginInput } from '../../../lib/validations';

const LoginPage = () => {
  const router = useRouter();
  const t = useTranslations('login');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    try {
      const validatedData = loginSchema.parse(formData);
      setIsLoading(true);

      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (result?.error) {
        setSubmitError(t('invalidCredentials'));
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error: unknown) {
      const err = error as { name?: string; errors?: Array<{ path: string[]; message: string }> };
      if (err.name === 'ZodError' && err.errors) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e: { path: string[]; message: string }) => {
          if (e.path[0]) fieldErrors[e.path[0]] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setSubmitError(t('genericError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    setResetError('');
    const raw = resetPhone.replace(/\D/g, '');
    if (raw.length < 9) {
      setResetError(t('enterPhone') || 'შეიყვანეთ ტელეფონის ნომერი');
      return;
    }
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: resetPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || t('codeSentFailed') || 'კოდის გაგზავნა ვერ მოხერხდა');
        return;
      }
      setOtpCooldown(60);
    } catch {
      setResetError(t('codeSentFailed') || 'კოდის გაგზავნა ვერ მოხერხდა');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (resetNewPassword.length < 6) {
      setResetError(t('passwordMin') || 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError(t('passwordsMismatch') || 'პაროლები არ ემთხვევა');
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: resetPhone,
          otpCode: resetOtpCode,
          newPassword: resetNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || t('genericError'));
        setResetLoading(false);
        return;
      }
      setResetSuccess(true);
    } catch {
      setResetError(t('genericError'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mx-auto gap-4 flex flex-col items-center justify-center">
          <h2 className="mt-6 text-center text-3xl font-bold text-black">
            {t('title')}
          </h2>
          <p className="mt-2 text-center text-[16px] text-black">
            {t('orCreateAccount')}
            <Link href="/register" className="font-medium text-black hover:underline">
              {t('createAccountLink')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-[16px] font-medium text-red-800">{submitError}</p>
            </div>
          )}

          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">{t('email')}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300 text-black' : 'border-gray-300 text-black'
                } placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm`}
                placeholder={t('email')}
              />
              {errors.email && (
                <p className="mt-1 text-[16px] text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">{t('password')}</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border ${
                  errors.password ? 'border-red-300 text-black' : 'border-gray-300 text-black'
                } placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-[16px]`}
                placeholder={t('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-black"
              >
                {showPassword ? (
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
              {errors.password && (
                <p className="mt-1 text-[16px] text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-[16px] font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? tCommon('loading') : t('signIn')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setShowResetForm(true);
                setSubmitError('');
                setResetError('');
                setResetSuccess(false);
              }}
              className="text-[14px] font-medium text-gray-600 hover:text-black hover:underline"
            >
              {t('forgotPassword')}
            </button>
          </div>
        </form>

        {showResetForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowResetForm(false);
                setResetError('');
                setResetSuccess(false);
                setResetPhone('');
                setResetOtpCode('');
                setResetNewPassword('');
                setResetConfirmPassword('');
              }
            }}
          >
            <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setShowResetForm(false);
                  setResetError('');
                  setResetSuccess(false);
                  setResetPhone('');
                  setResetOtpCode('');
                  setResetNewPassword('');
                  setResetConfirmPassword('');
                }}
                className="absolute right-4 top-4 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-black"
                aria-label={tCommon('close')}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {resetSuccess ? (
              <div className="space-y-4 pt-2">
                <p className="text-[16px] font-medium text-green-700">{t('resetSuccess')}</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(false);
                    setResetSuccess(false);
                    setResetPhone('');
                    setResetOtpCode('');
                    setResetNewPassword('');
                    setResetConfirmPassword('');
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-[16px] font-medium text-black hover:bg-gray-50"
                >
                  {t('backToLogin')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 pt-2">
                <h3 className="text-lg font-semibold text-black pr-8">{t('resetTitle')}</h3>
                {resetError && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-[14px] text-red-800">{resetError}</p>
                  </div>
                )}
                <div>
                  <label htmlFor="resetPhone" className="mb-1 block text-[14px] font-medium text-gray-700">
                    {t('resetPhone')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="resetPhone"
                      type="tel"
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-[16px] text-black placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black"
                      placeholder={t('resetPhonePlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={handleSendResetOtp}
                      disabled={otpCooldown > 0}
                      className="rounded-md bg-gray-800 px-4 py-2 text-[14px] font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {otpCooldown > 0 ? `${otpCooldown} ${t('seconds')}` : t('resetSendCode')}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="resetOtpCode" className="mb-1 block text-[14px] font-medium text-gray-700">
                    {t('resetOtpCode')}
                  </label>
                  <input
                    id="resetOtpCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-[16px] text-black placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black"
                    placeholder={t('resetOtpPlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="resetNewPassword" className="mb-1 block text-[14px] font-medium text-gray-700">
                    {t('resetNewPassword')}
                  </label>
                  <div className="relative">
                    <input
                      id="resetNewPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-[16px] text-black placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black"
                      placeholder={t('resetNewPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-black"
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
                </div>
                <div>
                  <label htmlFor="resetConfirmPassword" className="mb-1 block text-[14px] font-medium text-gray-700">
                    {t('resetConfirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      id="resetConfirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-[16px] text-black placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black"
                      placeholder={t('resetConfirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-black"
                    >
                    {showConfirmPassword ? (
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
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 rounded-md bg-black py-2 px-4 text-[16px] font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? tCommon('loading') : t('resetButton')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false);
                      setResetError('');
                      setResetPhone('');
                      setResetOtpCode('');
                      setResetNewPassword('');
                      setResetConfirmPassword('');
                    }}
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-[16px] font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t('backToLogin')}
                  </button>
                </div>
              </form>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
