"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef<HTMLDivElement | null>(null);
    const { data: session, status } = useSession();

    const navLinks = [
        { href: '/', label: 'სერვისები' },
        { href: '/stores', label: 'მაღაზიები' },
        { href: '/pricing', label: 'ტარიფები' },
        { href: '/faq', label: 'კითხვები' },
        { href: '/help', label: 'დახმარება' },
        { href: '/contact', label: 'კონტაქტი' },
    ];

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
                      width: '100px',
                      height: '100px',
                      objectFit: 'contain'
                    }}
                  />
                </Link>

                {/* Desktop Navigation */}
                <nav className="nav-desktop">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href}
                            className="nav-link text-white"
                        >
                            {link.label}
                        </Link>
                    ))}
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

            {/* Mobile Navigation */}
            <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
                {navLinks.map((link) => (
                    <Link 
                        key={link.href} 
                        href={link.href}
                        className="nav-link-mobile"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {link.label}
                    </Link>
                ))}
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
                      className="auth-button-mobile text-white"
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
                      className="auth-button-mobile text-white"
                      onClick={() => setIsMenuOpen(false)}
                  >
                      ავტორიზაცია
                  </Link>
                )}
            </nav>
        </header>
    );
}

export default Header;
