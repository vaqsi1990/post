'use client';

import React, { useEffect, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const ResetPasswordPage = () => {
  const router = useRouter();
  const t = useTranslations('login');
  const tCommon = useTranslations('common');

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
    <div className="min-h-screen  flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full mt-14 max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-black">{t('resetTitle')}</h2>
          <p className="mt-2 text-[16px] text-black">
            <Link href="/login" className="font-medium text-black hover:underline">
              {t('backToLogin')}
            </Link>
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl max-h-[calc(100svh-6rem)] overflow-y-auto no-scrollbar">
          {resetSuccess ? (
            <div className="space-y-4">
              <p className="text-[16px] font-medium text-green-700">{t('resetSuccess')}</p>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-[16px] font-medium text-black hover:bg-gray-50"
              >
                {t('backToLogin')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {resetError && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-[14px] text-red-800">{resetError}</p>
                </div>
              )}

              <div>
                <label htmlFor="resetPhone" className="mb-1 block text-[15px] md:text-[18px] font-medium text-black">
                  {t('resetPhone')}
                </label>
                <div className="flex flex-col md:flex-row gap-2">
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
                    className="rounded-md bg-[#3a5bff] px-4 py-2 text-[16px] font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {otpCooldown > 0 ? `${otpCooldown} ${t('seconds')}` : t('resetSendCode')}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="resetOtpCode" className="mb-1 block text-[15px] md:text-[18px] font-medium text-black">
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
                <label htmlFor="resetNewPassword" className="mb-1 block text-[15px] md:text-[18px] font-medium text-black">
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-black"
                  >
                    {showNewPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="resetConfirmPassword" className="mb-1 block text-[15px] md:text-[18px] font-medium text-black">
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-black"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full rounded-md bg-[#3a5bff] py-2 px-4 text-[16px] font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? tCommon('loading') : t('resetButton')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

