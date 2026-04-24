import React from "react";
import type { Metadata } from 'next';
import { getPageSeoMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

type ContactAddress = {
  countryKey: string;
  countryCode: string;
  adress: string;
  cityKey: string;
  stateKey?: string;
  postalCode: string;
  phone: string;
  mapEmbedUrl?: string;
  workingHours?: Array<{ dayKey: string; time: string }>;
};

const addresses: ContactAddress[] = [
  {
    countryKey: "ge",
    countryCode: "GE",
    adress: "იური გაგარინის ქუჩა 4/4ა",
    cityKey: "თბილისი",
    postalCode: "0160",
    phone: "+995 591 357 357",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d744.3538607707357!2d44.7685562!3d41.7331312!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x404472e617d00001%3A0xeb1aa7f4ba81d489!2sJuri%2C%204%2F4%20Iuri%20Gagarini%20St%2C%20T%27bilisi!5e0!3m2!1sen!2sge!4v1774941743964!5m2!1sen!2sge",
    workingHours: [
      { dayKey: "everyday", time: "11:00 - 19:00" },
      { dayKey: "online", time: "11:00 - 22:00" },
    ],
  },
  {
    countryKey: "fr",
    countryCode: "FR",
    adress: "7 bis rue decres",
    cityKey: "Paris",
    postalCode: "75014",
    phone: "+33 7 53 19 86 83",
  },
  {
    countryKey: "uk",
    countryCode: "GB",
    adress: "13 Oglethorpe Road",
    cityKey: "Dagenham",
    stateKey: "Essex",
    postalCode: "RM10 7SA",
    phone: "+44 7386 585212",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2480.6231181268936!2d0.14853970000000002!3d51.55680949999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a50dce88cf13%3A0xfd3b00dc0aaf7ab9!2s13%20Oglethorpe%20Rd%2C%20Dagenham%20RM10%207SA%2C%20UK!5e0!3m2!1sen!2sge!4v1774941576350!5m2!1sen!2sge",
  },
  {
    countryKey: "us",
    phone: "+1 (934) 777-5589",
    countryCode: "US",
    adress: "22 Parkway Circle, unit5",
    stateKey: "DELAWARE (DE)",
    cityKey: "New Castle",
    postalCode: "19720",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3071.4048731036296!2d-75.6154525!3d39.6631062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c7037c8a5160f7%3A0x64f625d37d93c3be!2s22%20Parkway%20Cir%20Suite%205%2C%20New%20Castle%2C%20DE%2019720%2C%20USA!5e0!3m2!1sen!2sge!4v1774941427350!5m2!1sen!2sge",
    workingHours: [
      { dayKey: "mon", time: "09:30 - 17:00" },
      { dayKey: "tue", time: "09:30 - 17:00" },
      { dayKey: "wed", time: "09:30 - 17:00" },
      { dayKey: "thu", time: "09:30 - 17:00" },
      { dayKey: "fri", time: "09:30 - 17:00" },
    ],
  },
  {
    countryKey: "cn",
    countryCode: "CN",
    adress: "广州市白云区聚源街50号欣凯科创园C栋102",
    cityKey: "Guangzhou City / 广州",
    stateKey: "GuangDong Province / 广东省",
    postalCode: "510407",
    phone: "+86 16602079929",
  },
];

const countryTitle: Record<string, string> = {
  GE: "Georgia",
  GB: "United Kingdom",
  US: "United States",
  FR: "France",
  CN: "China",
};

function mapQuery(address: ContactAddress) {
  const parts = [
    address.adress,
    address.cityKey,
    address.stateKey ?? "",
    address.postalCode,
    address.countryCode,
  ].filter(Boolean);
  return encodeURIComponent(parts.join(", "));
}

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/contact');
}

export default async function ContactPage() {
  const t = await getTranslations('contact');

  return (
    <main className="min-h-screen mt-24  px-4 py-12 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
          {t('addressesTitle')}
        </h1>
       

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {addresses.map((address) => (
            <article
              key={`${address.countryCode}-${address.postalCode}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <iframe
                title={`${countryTitle[address.countryCode]} map`}
                src={
                  address.mapEmbedUrl ??
                  `https://www.google.com/maps?q=${mapQuery(address)}&output=embed`
                }
                className="h-52 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="space-y-2 p-4 text-sm text-slate-700">
                <p className="text-base font-semibold text-slate-900">
                  {countryTitle[address.countryCode]} ({address.countryCode})
                </p>
                <p>{address.adress}</p>
                <p>
                  {address.cityKey}
                  {address.stateKey ? `, ${address.stateKey}` : ""}
                </p>
                <p>{address.postalCode}</p>
                <p className="font-medium">{address.phone}</p>
                {address.workingHours?.length ? (
                  <div className="pt-2">
                    <p className="mb-1 font-semibold text-slate-900">{t('workingHoursTitle')}</p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      {address.workingHours.map((row) => (
                        <div key={row.dayKey} className="flex justify-between gap-3">
                          <span>{t(`days.${row.dayKey}`)}:</span>
                          <span>{row.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}