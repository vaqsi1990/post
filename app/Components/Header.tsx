"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';

type NavLinkItem = { href: string; label: string };
type NavItem =
    | { type: 'link'; href: string; label: string }
    | { type: 'dropdown'; href: string; label: string; children: NavLinkItem[] };

const navLinks: NavItem[] = [
    {
        type: 'dropdown',
        href: '/',
        label: 'სერვისები',
        children: [
            { href: '/#online-shopping', label: 'ონლაინ შოპინგი' },
            { href: '/#commercial-export', label: 'კომერციული ტვირთების ექსპორტი' },
            { href: '/#customs-broker', label: 'საბაჟო-საბროკერო მომსახურება' },
            { href: '/#courier', label: 'საკურიერო მომსახურება' },
        ],
    },
    { type: 'link', href: '/stores', label: 'მაღაზიები' },
    { type: 'link', href: '/pricing', label: 'ტარიფები' },
    {
        type: 'dropdown',
        href: '/faq',
        label: 'კითხვები',
        children: [
            { href: '/faq#subscribe', label: 'როგორ გამოვიწერო?' },
            { href: '/faq#customs-rules', label: 'საბაჟო წესები' },
            { href: '/faq#prohibited', label: 'აკრძალული ნივთები' },
            { href: '/faq#faq', label: 'ხშირად დასმული კითხვები' },
            { href: '/faq#about', label: 'ჩვენს შესახებ' },
        ],
    },
    {
        type: 'dropdown',
        href: '/help',
        label: 'დახმარება',
        children: [
            { href: '/help#guide', label: 'ონლაინ გიდი' },
        ],
    },
    { type: 'link', href: '/contact', label: 'კონტაქტი' },
];

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
    const accountMenuRef = useRef<HTMLDivElement | null>(null);
    const { data: session, status } = useSession();

    const isAuthed = status === 'authenticated';
    const role = session?.user?.role;
    const panelHref = role === 'ADMIN' ? '/admin' : '/dashboard';
    const panelLabel = role === 'ADMIN' ? 'Admin Panel' : 'ჩემი კაბინეტი';
    const accountTriggerLabel = session?.user?.name?.trim() ? session.user.name : 'ანგარიში';

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

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
                  <Image 
                    src="/logo.jpg" 
                    alt="Logo" 
                    width={110} 
                    height={110}
                    className="
                     rounded-full"
                    priority
                    unoptimized
                    style={{ 
                      opacity: 1, 
                      display: 'block',
                      visibility: 'visible',
                      width: '135px',
                      height: '135px',
                      objectFit: 'contain'
                    }}
                  />
                </Link>

                {/* Desktop Navigation - dropdowns open on hover */}
                <nav className="nav-desktop">
                    {navLinks.map((item) =>
                        item.type === 'link' ? (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="nav-link text-white"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <div key={item.href + item.label} className="header-dropdown header-dropdown-nav">
                                <Link
                                    href={item.href}
                                    className="nav-link header-dropdown-trigger text-white"
                                    aria-haspopup="menu"
                                >
                                    {item.label}
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
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </nav>

                {/* Auth Button */}
                <div className="header-actions">
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
                            გამოსვლა
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link href="/login" className="auth-button">
                        ავტორიზაცია
                      </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="mobile-menu-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
            </div>

            {/* Mobile menu backdrop */}
            {isMenuOpen && (
              <div
                className="nav-mobile-backdrop"
                aria-hidden="true"
                onClick={() => setIsMenuOpen(false)}
              />
            )}

            {/* Mobile Navigation — slides in from right */}
            <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
                <div className="nav-mobile-header">
                  <span className="nav-mobile-title">მენიუ</span>
                  <button
                    type="button"
                    className="nav-mobile-close"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <span aria-hidden>×</span>
                  </button>
                </div>
                <div className="nav-mobile-links">
                  {navLinks.map((item) =>
                    item.type === 'link' ? (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="nav-link-mobile"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <div key={item.href + item.label} className="nav-mobile-dropdown">
                        <button
                          type="button"
                          className="nav-link-mobile nav-mobile-dropdown-trigger"
                          onClick={() => setOpenMobileDropdown((v) => (v === item.label ? null : item.label))}
                          aria-expanded={openMobileDropdown === item.label}
                        >
                          {item.label}
                          <span className="nav-mobile-dropdown-caret" aria-hidden="true">
                            {openMobileDropdown === item.label ? '▴' : '▾'}
                          </span>
                        </button>
                        {openMobileDropdown === item.label && (
                          <div className="nav-mobile-dropdown-panel">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="nav-link-mobile nav-link-mobile-sub"
                                onClick={() => { setIsMenuOpen(false); setOpenMobileDropdown(null); }}
                              >
                                {child.label}
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
                        გამოსვლა
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="auth-button-mobile"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ავტორიზაცია
                    </Link>
                  )}
                </div>
            </nav>
        </header>
    );
}

export default Header;
