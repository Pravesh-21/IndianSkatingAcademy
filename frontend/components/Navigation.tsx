'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Logo from './Logo';

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const linkClass = (href: string) =>
    pathname === href ? 'active' : '';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/events', label: 'Events' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/programs', label: 'Programs' },
    { href: '/locations', label: 'Locations' },
    { href: '/join', label: 'Enquiry' },
    { href: '/admission', label: 'Admission', highlight: true },
  ];

  return (
    <>
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}${menuOpen ? ' nav--menu-open' : ''}`}>
        <Link 
          href="/" 
          className="nav-logo" 
          data-cursor-hover
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            textShadow: 'none', 
            transform: 'none',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            letterSpacing: 'inherit'
          }}
        >
          <Logo variant="navbar" />
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${linkClass(link.href)}${(link as any).highlight ? ' nav-link-highlight' : ''}`}
              data-cursor-hover
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger button */}
        <button
          className={`nav-hamburger${menuOpen ? ' nav-hamburger--active' : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          data-cursor-hover
        >
          <span className="nav-hamburger-line" />
          <span className="nav-hamburger-line" />
          <span className="nav-hamburger-line" />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`nav-mobile-overlay${menuOpen ? ' nav-mobile-overlay--open' : ''}`}>
        <div className="nav-mobile-menu">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-mobile-link${pathname === link.href ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
              style={{ animationDelay: menuOpen ? `${0.05 + i * 0.05}s` : '0s' }}
              data-cursor-hover
            >
              <span className="nav-mobile-link-label">{link.label}</span>
              <span className="nav-mobile-link-arrow">→</span>
            </Link>
          ))}
          <div className="nav-mobile-footer">
          </div>
        </div>
      </div>
    </>
  );
}
