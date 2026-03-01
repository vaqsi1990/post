'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { registerSchema } from '../../lib/validations';
import type { RegisterInput } from '../../lib/validations';

const RegisterPage = () => {
  const router = useRouter();
  const t = useTranslations('register');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState<RegisterInput & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    otpCode: '',
    personalIdNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setSubmitError('');
  };

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setInterval(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next.phone;
      delete next.otpCode;
      return next;
    });
    setSubmitError('');
    const raw = formData.phone?.replace(/\D/g, '') ?? '';
    if (raw.length < 9) {
      setErrors((prev) => ({ ...prev, phone: t('enterPhone') }));
      return;
    }
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || t('codeSentFailed'));
        return;
      }
      setOtpSent(true);
      setOtpCooldown(60);
    } catch {
      setSubmitError(t('codeSentFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    try {
      // Validate with Zod
      const validatedData = registerSchema.parse(formData);

      setIsLoading(true);

      // Remove confirmPassword before sending to API (otpCode is sent)
      const { confirmPassword, ...dataToSend } = validatedData;

      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          // Handle Zod validation errors from server
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            const fieldName = err.field || (err.path && err.path[0]);
            if (fieldName) {
              fieldErrors[fieldName] = err.message;
            }
          });
          
          // Also try rawErrors if details don't have the right format
          if (data.rawErrors && Array.isArray(data.rawErrors)) {
            data.rawErrors.forEach((err: any) => {
              if (err.path && err.path[0]) {
                fieldErrors[err.path[0]] = err.message;
              }
            });
          }
          
          setErrors(fieldErrors);
          
          // Show detailed error message
          if (data.error) {
            setSubmitError(data.error);
          }
        } else {
          setSubmitError(data.error || data.message || t('registrationError'));
        }
      } else {
        router.push('/login');
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mt-14 space-y-8">
        <div className="text-center mx-auto gap-4 flex flex-col items-center justify-center">
          <h2 className="mt-6 text-center text-3xl font-bold text-black">
            {t('title')}
          </h2>
          <p className="mt-2 text-center text-[16px] text-black">
            {t('orSignIn')}
            <Link href="/login" className="font-medium text-black hover:underline">
              {t('signInLink')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-[16px] font-medium text-red-800">{submitError}</p>
            </div>
          )}

          <div className="rounded-md  space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-[16px] font-medium text-black mb-1">
                {t('firstName')}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.firstName
                    ? 'border-red-300 text-black'
                    : 'border-gray-300 text-black'
                } placeholder-gray-500 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-[16px]`}
                placeholder={t('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-[16px] text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-[16px] font-medium text-black mb-1">
                {t('lastName')}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.lastName
                    ? 'border-red-300 text-black'
                    : 'border-gray-300 text-black'
                } placeholder-gray-500 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-[16px]`}
                placeholder={t('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-[16px] text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-[16px] font-medium text-black mb-1">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.email
                    ? 'border-red-300 text-black'
                    : 'border-gray-300 text-black'
                } placeholder-gray-500 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                placeholder={t('email')}
              />
              {errors.email && (
                <p className="mt-1 text-[16px] text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-[16px] font-medium text-black mb-1">
                {t('phone')}
              </label>
              <div className="flex gap-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`flex-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.phone
                      ? 'border-red-300 text-black'
                      : 'border-gray-300 text-black'
                  } placeholder-gray-500 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-[16px]`}
                  placeholder={t('phonePlaceholder')}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpCooldown > 0}
                  className="px-4 py-2 rounded-md text-[14px] font-medium bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {otpCooldown > 0 ? `${otpCooldown} ${t('seconds')}` : t('sendCode')}
                </button>
              </div>
              {errors.phone && (
                <p className="mt-1 text-[16px] text-red-600">{errors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="otpCode" className="block text-[16px] font-medium text-black mb-1">
                {t('otpCode')}
              </label>
              <input
                id="otpCode"
                name="otpCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={formData.otpCode}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData((prev) => ({ ...prev, otpCode: v }));
                  if (errors.otpCode) setErrors((prev) => ({ ...prev, otpCode: '' }));
                }}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.otpCode ? 'border-red-300 text-black' : 'border-gray-300 text-black'
                } placeholder-gray-500 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-[16px]`}
                placeholder={otpSent ? t('otpPlaceholder') : t('otpPlaceholderBefore')}
              />
              {errors.otpCode && (
                <p className="mt-1 text-[16px] text-red-600">{errors.otpCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="personalIdNumber" className="block text-[16px] font-medium text-black mb-1">
                {t('personalIdNumber')}
              </label>
              <input
                id="personalIdNumber"
                name="personalIdNumber"
                type="text"
                required
                maxLength={11}
                value={formData.personalIdNumber}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.personalIdNumber
                    ? 'border-red-300 text-black'
                    : 'border-gray-300 text-black'
                } placeholder-gray-500 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-[16px]`}
                placeholder={t('personalIdPlaceholder')}
              />
              {errors.personalIdNumber && (
                <p className="mt-1 text-[16px] text-red-600">{errors.personalIdNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-[16px] font-medium text-black mb-1">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    errors.password
                      ? 'border-red-300 text-black'
                      : 'border-gray-300 text-black'
                  } placeholder-gray-500 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-[16px]`}
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
              </div>
              {errors.password && (
                <p className="mt-1 text-[16px] text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[16px] font-medium text-black mb-1">
                {t('repeatPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    errors.confirmPassword
                      ? 'border-red-300 text-black'
                      : 'border-gray-300 text-black'
                  } placeholder-gray-500 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-[16px]`}
                  placeholder={t('repeatPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-black"
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
              {errors.confirmPassword && (
                <p className="mt-1 text-[16px] text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-[16px] font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? tCommon('loading') : t('registerButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
