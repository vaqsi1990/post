import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function toQueryString(params: Record<string, string | string[] | undefined>) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) usp.append(key, v);
    } else {
      usp.set(key, value);
    }
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export default async function AuthPage({ searchParams }: Props) {
  const locale = await getLocale();
  const params = (await searchParams) ?? {};
  redirect(`/${locale}/login${toQueryString(params)}`);
}

