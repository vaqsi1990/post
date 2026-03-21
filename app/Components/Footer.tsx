'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
const Footer = () => {
  const t = useTranslations('footer');

  return (
    <footer
      className="w-full py-8 md:py-10 border-t border-white/10"
      style={{
        background: 'linear-gradient(90deg, #FF4FD8, #3A5BFF, #8A3CFF, #FF4FD8)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="text-white/90 text-[14px] leading-relaxed md:max-w-[min(100%,28rem)] md:text-left">
            <div className="font-semibold text-[16px] md:text-[18px] mb-1">{t('contactsTitle')}</div>
            <div>
              {t('addressLabel')}: {t('addressValue')}
            </div>
            <div className="mt-1">
              {t('phoneLabel')}:{" "}
              <a
                className="underline decoration-white/40 hover:decoration-white/80"
                href={`tel:${t('phoneValue').replace(/\s+/g, '')}`}
              >
                {t('phoneValue')}
              </a>
            </div>
            <div className="mt-1">
              {t('hoursLabel')}: {t('hoursValue')}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-4 self-end md:self-auto md:items-end">
            <h2 className="text-right text-[16px] font-semibold text-white">
              {t('contactUsTitle')}
            </h2>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/995591357357"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25D366] hover:bg-[#1faa4a] border border-white/20 w-11 h-11 transition-colors"
                aria-label="WhatsApp"
              >
                {/* WhatsApp icon */}
                <FaWhatsapp className="text-white text-[22px]" />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#1877F2] hover:bg-[#0f65d8] border border-white/20 w-11 h-11 transition-colors"
                aria-label="Facebook"
              >
                {/* Facebook icon */}
                <FaFacebook className="text-white text-[22px]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
