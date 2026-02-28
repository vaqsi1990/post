'use client';

import React from 'react';
import GB from 'country-flag-icons/react/3x2/GB';
import US from 'country-flag-icons/react/3x2/US';
import CN from 'country-flag-icons/react/3x2/CN';
import IT from 'country-flag-icons/react/3x2/IT';
import GR from 'country-flag-icons/react/3x2/GR';
import ES from 'country-flag-icons/react/3x2/ES';
import FR from 'country-flag-icons/react/3x2/FR';
import DE from 'country-flag-icons/react/3x2/DE';
import TR from 'country-flag-icons/react/3x2/TR';

const FLAGS: Record<string, React.ComponentType<{ title?: string; className?: string }>> = {
  GB, US, CN, IT, GR, ES, FR, DE, TR,
};

const TARIFFS = [
  { country: 'დიდი ბრიტანეთი', countryCode: 'GB', pricePerKg: 4.5 },
  { country: 'ამერიკა', countryCode: 'US', pricePerKg: 5.5 },
  { country: 'ჩინეთი', countryCode: 'CN', pricePerKg: 3.2 },
  { country: 'იტალია', countryCode: 'IT', pricePerKg: 4.0 },
  { country: 'საბერძნეთი', countryCode: 'GR', pricePerKg: 3.8 },
  { country: 'ესპანეთი', countryCode: 'ES', pricePerKg: 4.2 },
  { country: 'საფრანგეთი', countryCode: 'FR', pricePerKg: 4.0 },
  { country: 'გერმანია', countryCode: 'DE', pricePerKg: 3.9 },
  { country: 'თურქეთი', countryCode: 'TR', pricePerKg: 2.8 },
] as const;

export default function Tariffs() {
  return (
    <section className="w-full bg-white py-14 md:py-20">
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="text-center mb-3 md:mb-4">
         
        </div>
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-black md:text-[30px] text-[18px] font-bold">
            ტარიფები 
          </h2>
         
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="text-left py-4 px-4 md:px-6 text-black font-semibold text-sm md:text-[18px]">
                    ქვეყანა
                  </th>
                  <th className="text-right py-4 px-4 md:px-6 text-black font-semibold text-sm md:text-[18px]">
                    ფასი / კგ ($)
                  </th>
                </tr>
              </thead>
              <tbody>
                {TARIFFS.map((row, i) => (
                  <tr
                    key={row.country}
                    className={`border-b border-gray-100 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="py-3 px-4 md:px-6 text-gray-900 text-sm md:text-[18px] font-medium">
                      <span className="inline-flex items-center gap-2">
                        {(() => {
                          const Flag = FLAGS[row.countryCode];
                          return Flag ? (
                            <Flag
                              title={row.country}
                              className="w-7 h-5 md:w-8 md:h-6 rounded object-cover shrink-0"
                            />
                          ) : null;
                        })()}
                        {row.country}
                      </span>
                    </td>
                    <td className="py-3 px-4 md:px-6 text-right text-gray-900 text-sm md:text-[18px] font-semibold">
                      $ {row.pricePerKg.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs md:text-sm mt-4">
          * ფასები შეიძლება შეიცვალოს. ზუსტი ღირებულებისთვის დაგვიკავშირდით.
        </p>
      </div>
    </section>
  );
}
