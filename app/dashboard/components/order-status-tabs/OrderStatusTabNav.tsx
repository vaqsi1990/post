'use client';

import { ORDER_STATUS_TABS } from './orderStatusTabsConfig';

type Props = {
  activeTab: string;
  onTabChange: (key: string) => void;
  getCount: (key: string) => number;
};

export default function OrderStatusTabNav({ activeTab, onTabChange, getCount }: Props) {
  return (
    <nav className="flex mb-3 flex-nowrap gap-4 lg:gap-6">
      {ORDER_STATUS_TABS.map((tab) => {
        const count = getCount(tab.key);
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-4 px-4 py-3 text-[15px] font-semibold transition-colors rounded-t-lg border-b-2 -mb-px shrink-0 ${
              isActive
                ? 'bg-black text-white border-black'
                : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span className="whitespace-nowrap">{tab.label}</span>
            <span
              className={`inline-flex min-w-[1.5rem] justify-center rounded-full px-2 py-0.5 text-[13px] font-bold shrink-0 ${
                isActive ? 'bg-amber-400 text-black' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
