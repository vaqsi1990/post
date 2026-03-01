"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';

type NavLinkItem = { href: string; labelKey: string };
type NavItem =
  | { type: 'link'; href: string; labelKey: string }
  | { type: 'dropdown'; href: string; labelKey: string; children: NavLinkItem[] };

const navStructure: NavItem[] = [
  {
    type: 'dropdown',
    href: '/',
    labelKey: 'header.services',
    children: [
      { href: '/#online-shopping', labelKey: 'header.onlineShopping' },
      { href: '/#commercial-export', labelKey: 'header.commercialExport' },
      { href: '/#customs-broker', labelKey: 'header.customsBroker' },
      { href: '/#courier', labelKey: 'header.courier' },
    ],
  },
  { type: 'link', href: '/stores', labelKey: 'header.stores' },
  { type: 'link', href: '/pricing', labelKey: 'header.pricing' },
  {
    type: 'dropdown',
    href: '/faq',
    labelKey: 'header.faq',
    children: [
      { href: '/faq#subscribe', labelKey: 'header.howToSubscribe' },
      { href: '/faq#customs-rules', labelKey: 'header.customsRules' },
      { href: '/faq#prohibited', labelKey: 'header.prohibited' },
      { href: '/faq#faq', labelKey: 'header.faqTitle' },
      { href: '/faq#about', labelKey: 'header.about' },
    ],
  },
  {
    type: 'dropdown',
    href: '/help',
    labelKey: 'header.help',
    children: [
      { href: '/help#guide', labelKey: 'header.onlineGuide' },
    ],
  },
  { type: 'link', href: '/contact', labelKey: 'header.contact' },
];

const Header = () => {
  const t = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const { data: session, status } = useSession();

  const isAuthed = status === 'authenticated';
  const role = session?.user?.role;
  const panelHref = role === 'ADMIN' ? '/admin' : '/dashboard';
  const panelLabel = role === 'ADMIN' ? t('common.adminPanel') : t('common.myCabinet');
  const accountTriggerLabel = session?.user?.name?.trim() ? session.user.name : t('common.account');

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = accountMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAccountMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isAccountMenuOpen]);

  const getLabel = (labelKey: string) => t(labelKey);

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={110}
            height={110}
            className="rounded-full"
            priority
            unoptimized
            style={{
              opacity: 1,
              display: 'block',
              visibility: 'visible',
              width: '135px',
              height: '135px',
              objectFit: 'contain',
            }}
          />
        </Link>

        <nav className="nav-desktop">
          {navStructure.map((item) =>
            item.type === 'link' ? (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link text-white"
              >
                {getLabel(item.labelKey)}
              </Link>
            ) : (
              <div key={item.href + item.labelKey} className="header-dropdown header-dropdown-nav">
                <Link
                  href={item.href}
                  className="nav-link header-dropdown-trigger text-white"
                  aria-haspopup="menu"
                >
                  {getLabel(item.labelKey)}
                  <span className="header-dropdown-caret" aria-hidden="true">▾</span>
                </Link>
                <div className="header-dropdown-menu header-dropdown-menu-nav" role="menu">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="header-dropdown-item header-dropdown-item-nav"
                      role="menuitem"
                    >
                      {getLabel(child.labelKey)}
                    </Link>
                  ))}
                </div>
              </div>
            )
          )}
        </nav>

        <div className="header-actions">
          <LocaleSwitcher />
          {isAuthed ? (
            <div className="header-dropdown" ref={accountMenuRef}>
              <button
                type="button"
                className="auth-button header-dropdown-trigger"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                onClick={() => setIsAccountMenuOpen((v) => !v)}
              >
                {accountTriggerLabel}
                <span className="header-dropdown-caret" aria-hidden="true">▾</span>
              </button>
              <div
                className={`header-dropdown-menu ${isAccountMenuOpen ? 'open' : ''}`}
                role="menu"
              >
                <Link
                  href={panelHref}
                  className="header-dropdown-item"
                  role="menuitem"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  {panelLabel}
                </Link>
                <button
                  type="button"
                  className="header-dropdown-item text-white"
                  role="menuitem"
                  onClick={async () => {
                    setIsAccountMenuOpen(false);
                    await signOut({ callbackUrl: '/' });
                  }}
                >
                  {t('header.logout')}
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="auth-button">
              {t('header.login')}
            </Link>
          )}
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={t('header.toggleMenu')}
        >
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {isMenuOpen && (
        <div
          className="nav-mobile-backdrop"
          aria-hidden="true"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
        <div className="nav-mobile-header">
          <span className="nav-mobile-title">{t('common.menu')}</span>
          <button
            type="button"
            className="nav-mobile-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label={t('common.close')}
          >
            <span aria-hidden>×</span>
          </button>
        </div>
        <div className="nav-mobile-links">
          {navStructure.map((item) =>
            item.type === 'link' ? (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link-mobile"
                onClick={() => setIsMenuOpen(false)}
              >
                {getLabel(item.labelKey)}
              </Link>
            ) : (
              <div key={item.href + item.labelKey} className="nav-mobile-dropdown">
                <button
                  type="button"
                  className="nav-link-mobile nav-mobile-dropdown-trigger"
                  onClick={() =>
                    setOpenMobileDropdown((v) => (v === item.labelKey ? null : item.labelKey))
                  }
                  aria-expanded={openMobileDropdown === item.labelKey}
                >
                  {getLabel(item.labelKey)}
                  <span className="nav-mobile-dropdown-caret" aria-hidden="true">
                    {openMobileDropdown === item.labelKey ? '▴' : '▾'}
                  </span>
                </button>
                {openMobileDropdown === item.labelKey && (
                  <div className="nav-mobile-dropdown-panel">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="nav-link-mobile nav-link-mobile-sub"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setOpenMobileDropdown(null);
                        }}
                      >
                        {getLabel(child.labelKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
        <div className="nav-mobile-actions">
          {isAuthed ? (
            <>
              <Link
                href={panelHref}
                className="auth-button-mobile"
                onClick={() => setIsMenuOpen(false)}
              >
                {panelLabel}
              </Link>
              <button
                type="button"
                className="auth-button-mobile auth-button-mobile-outline"
                onClick={async () => {
                  setIsMenuOpen(false);
                  await signOut({ callbackUrl: '/' });
                }}
              >
                {t('header.logout')}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="auth-button-mobile"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('header.login')}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
