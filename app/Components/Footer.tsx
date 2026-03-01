'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black mt-14 md:mt-0 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-black text-[16px]">
            <p>© {currentYear} {t('rights')}</p>
          </div>
          <div className="text-black text-[16px]">
            <p>{t('madeWith')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
