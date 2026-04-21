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
  | { type: 'dropdown'; href?: string; labelKey: string; children: NavLinkItem[] };

const servicesLinks: NavLinkItem[] = [
  { href: '/services?service=service1', labelKey: 'header.onlineShopping' },
  { href: '/services?service=service4', labelKey: 'header.commercialExport' },
  { href: '/services?service=service3', labelKey: 'header.customsBroker' },
  { href: '/services?service=service2', labelKey: 'header.courier' },
  { href: '/calculator', labelKey: 'header.calculator' },
  { href: '/dates', labelKey: 'header.dates' },
];

const conditionsLinks: NavLinkItem[] = [
  { href: '/conditions?section=provider-duties', labelKey: 'header.providerDuties' },
  { href: '/conditions?section=customer-duties', labelKey: 'header.customerDuties' },
  { href: '/conditions?section=calculation-rules', labelKey: 'header.calculationRules' },
  { href: '/conditions?section=declaration-service', labelKey: 'header.declarationService' },
  { href: '/conditions?section=third-party-pickup', labelKey: 'header.thirdPartyPickup' },
  { href: '/conditions?section=confidentiality', labelKey: 'header.confidentiality' },
  { href: '/conditions?section=declarant-service', labelKey: 'header.declarantService' },
  { href: '/conditions?section=prohibited-items', labelKey: 'header.prohibitedItemsList' },
];



const faqLinks: NavLinkItem[] = [
  { href: '/faq', labelKey: 'header.faq' },
  
  { href: '/help#guide', labelKey: 'header.onlineGuide' },
];


function UserOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const navStructure: NavItem[] = [
  { type: 'link', href: '/about', labelKey: 'header.about' },
  { type: 'link', href: '/tracking', labelKey: 'header.tracking' },
  {
    type: 'dropdown',
    labelKey: 'header.services',
    children: servicesLinks,
  },
 {type: 'link',  href: '/contact',  labelKey: 'header.contact' },
  {type: 'link',  href: '/stores',  labelKey: 'header.stores' },
  {
    type: 'dropdown',
    labelKey: 'header.conditions',
    children: conditionsLinks,
  },

 
  {
    type: 'dropdown',
    href: '/faq',
    labelKey: 'header.help',
    children: faqLinks,
  },
  
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
  const panelHref =
    role === 'ADMIN'
      ? '/admin'
      : role === 'EMPLOYEE'
        ? '/employee'
        : role === 'SUPPORT'
          ? '/support'
        : '/dashboard';
  const panelLabel =
    role === 'ADMIN'
      ? t('common.adminPanel')
      : role === 'EMPLOYEE'
        ? t('common.employeePanel')
        : role === 'SUPPORT'
          ? t('common.supportPanel')
        : t('common.myCabinet');

  const rawName = session?.user?.name?.trim();
  const firstNameOnly = rawName
    ? rawName.split(/\s+/).filter(Boolean)[0] ?? ''
    : '';
  const roomNumber = session?.user?.roomNumber?.trim();
  const hasAccountLabel = Boolean(firstNameOnly || roomNumber);

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

  const renderNavItem = (item: NavItem) => {
    if (item.type === 'link') {
      return (
        <Link key={item.href} href={item.href} className="nav-link text-white">
          {getLabel(item.labelKey)}
        </Link>
      );
    }

    const isConditionsDropdown = item.labelKey === 'header.conditions';
    const half = isConditionsDropdown ? Math.ceil(item.children.length / 2) : 0;
    const firstCol = isConditionsDropdown ? item.children.slice(0, half) : [];
    const secondCol = isConditionsDropdown ? item.children.slice(half) : [];

    const dropdownKey = (item.href ?? '') + item.labelKey;

    return (
      <div
        key={dropdownKey}
        className="header-dropdown header-dropdown-nav"
      >
        {item.href ? (
          <Link
            href={item.href}
            className="nav-link  header-dropdown-trigger text-white"
            aria-haspopup="menu"
          >
            {getLabel(item.labelKey)}
            <span className="header-dropdown-caret" aria-hidden="true">
              ▾
            </span>
          </Link>
        ) : (
          <button
            type="button"
            className="nav-link header-dropdown-trigger text-white"
            aria-haspopup="menu"
          >
            {getLabel(item.labelKey)}
            <span className="header-dropdown-caret" aria-hidden="true">
              ▾
            </span>
          </button>
        )}
        <div
          className={`header-dropdown-menu header-dropdown-menu-nav ${
            isConditionsDropdown ? 'header-dropdown-menu-two-col' : ''
          }`}
          role="menu"
        >
          {isConditionsDropdown ? (
            <div className="header-dropdown-columns">
              <div className="header-dropdown-col">
                {firstCol.map((child) => (
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
              <div className="header-dropdown-col">
                {secondCol.map((child) => (
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
          ) : (
            item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="header-dropdown-item header-dropdown-item-nav"
                role="menuitem"
              >
                {getLabel(child.labelKey)}
              </Link>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo flex flex-col" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo2.jpg"
            alt="Logo"
            width={110}
            height={130}
            className="rounded-full"
            priority
            style={{
              opacity: 1,
              display: 'block',
              visibility: 'visible',
              width: '120px',
             
              objectFit: 'contain',
            }}
          />
          <span className="text-white md:text-[25px] text-[18px] font-bold drop-shadow-sm">Postifly</span>
        </Link>

        {/* Desktop nav in the top row */}
        <nav className="nav-desktop">
          {navStructure.map(renderNavItem)}
        </nav>

        <div className="header-actions">
          {isAuthed ? (
            <div className="header-dropdown" ref={accountMenuRef}>
              <button
                type="button"
                className="header-account-trigger header-dropdown-trigger"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                onClick={() => setIsAccountMenuOpen((v) => !v)}
              >
                <UserOutlineIcon className="header-auth-icon shrink-0" />
                <span className="header-account-label">
                  {hasAccountLabel ? (
                    <>
                      {firstNameOnly ? (
                        <span className="header-account-name">{firstNameOnly}</span>
                      ) : null}
                      {roomNumber ? (
                        <span
                          className={
                            firstNameOnly ? 'header-account-room' : 'header-account-name'
                          }
                        >
                          {roomNumber}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    t('common.account')
                  )}
                </span>
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
                  className="header-dropdown-item header-dropdown-item-logout"
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
            <div className="header-auth-guest">
              <UserOutlineIcon className="header-auth-icon" />
              <Link href="/login" className="header-auth-link">
                {t('header.login')}
              </Link>
              <Link href="/register" className="header-auth-link">
                {t('register.title')}
              </Link>
            </div>
          )}
          <LocaleSwitcher variant="compact" />
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
              <div key={(item.href ?? '') + item.labelKey} className="nav-mobile-dropdown">
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
          <div className="nav-mobile-locale">
            <LocaleSwitcher />
          </div>
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
            <>
              <Link
                href="/login"
                className="auth-button-mobile"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.login')}
              </Link>
              <Link
                href="/register"
                className="auth-button-mobile auth-button-mobile-outline"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('register.title')}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
