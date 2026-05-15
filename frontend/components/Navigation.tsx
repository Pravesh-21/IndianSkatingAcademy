'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (href: string) =>
    pathname === href ? 'active' : '';

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <Link href="/" className="nav-logo" data-cursor-hover>
        ISA
      </Link>
      <div className="nav-links">
        <Link href="/" className={linkClass('/')} data-cursor-hover>Home</Link>
        <Link href="/about" className={linkClass('/about')} data-cursor-hover>About</Link>
        <Link href="/events" className={linkClass('/events')} data-cursor-hover>Events</Link>
        <Link href="/gallery" className={linkClass('/gallery')} data-cursor-hover>Gallery</Link>
        <Link href="/programs" className={linkClass('/programs')} data-cursor-hover>Programs</Link>
        <Link href="/locations" className={linkClass('/locations')} data-cursor-hover>Locations</Link>
        <Link href="/join" className={linkClass('/join')} data-cursor-hover>Join</Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
