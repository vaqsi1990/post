"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'მთავარი' },
   
        { href: '/pricing', label: 'ტარიფები' },
        { href: '/faq', label: 'კითხვები' },
        { href: '/contact', label: 'კონტაქტი' },
    ];

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <Link href="/" className="logo">
                  <Image 
                    src="/post.jpg" 
                    alt="Logo" 
                    width={60} 
                    height={60}
                    className="logo-image"
                    priority
                    unoptimized
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
                    <Link href="/login" className="auth-button">
                        ავტორიზაცია
                    </Link>
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
                <Link 
                    href="/login" 
                    className="auth-button-mobile"
                    onClick={() => setIsMenuOpen(false)}
                >
                    ავტორიზაცია
                </Link>
            </nav>
        </header>
    );
}

export default Header;
