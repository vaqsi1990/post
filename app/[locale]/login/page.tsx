'use client';

import React, { useState } from 'react';
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
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
