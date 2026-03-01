'use client';

import { ORDER_STATUS_TABS } from './orderStatusTabsConfig';

type Props = {
  value: string;
  onChange: (key: string) => void;
  getCount: (key: string) => number;
};

const selectStyles = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 0.75rem center',
  backgroundSize: '1.25rem',
};

export default function OrderStatusSelect({ value, onChange, getCount }: Props) {
  return (
    <div className="border-b border-gray-200 pb-px">
      <label htmlFor="status-select" className="sr-only">
        სტატუსის არჩევა
      </label>
      <select
        id="status-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-t-lg border border-gray-200 border-b-2 border-b-black bg-black px-4 py-3 pr-10 text-[15px] font-semibold text-white appearance-none focus:outline-none focus:ring-2 focus:ring-gray-400"
        style={selectStyles}
      >
        {ORDER_STATUS_TABS.map((tab) => (
          <option key={tab.key} value={tab.key} className="bg-white text-black">
            {tab.label} ({getCount(tab.key)})
          </option>
        ))}
      </select>
    </div>
  );
}
