"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session, status } = useSession();

    const navLinks = [
        { href: '/', label: 'მთავარი' },
   
        { href: '/pricing', label: 'ტარიფები' },
        { href: '/faq', label: 'კითხვები' },
        { href: '/contact', label: 'კონტაქტი' },
    ];

    const isAuthed = status === 'authenticated';
    const role = session?.user?.role;
    const panelHref = role === 'ADMIN' ? '/admin' : '/dashboard';
    const panelLabel = role === 'ADMIN' ? 'Admin Panel' : 'ჩემი კაბინეტი';

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
                  <Image 
                    src="/post.jpg" 
                    alt="Logo" 
                    width={60} 
                    height={60}
                    className="logo-image"
                    priority
                    unoptimized
                    style={{ 
                      opacity: 1, 
                      display: 'block',
                      visibility: 'visible',
                      width: '60px',
                      height: '60px',
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
                      <div className="flex items-center gap-3">
                        <Link href={panelHref} className="auth-button">
                          {panelLabel}
                        </Link>
                        <button
                          type="button"
                          className="auth-button"
                          onClick={() => signOut({ callbackUrl: '/' })}
                        >
                          გამოსვლა
                        </button>
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
                      className="auth-button-mobile"
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
            </nav>
        </header>
    );
}

export default Header;
