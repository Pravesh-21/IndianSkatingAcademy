'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">ISA</Link>
      <div className="nav-links">
        <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
        <Link href="/events" className={pathname === '/events' ? 'active' : ''}>Events</Link>
        <Link href="/gallery" className={pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
        <Link href="/programs" className={pathname === '/programs' ? 'active' : ''}>Programs</Link>
        <Link href="/locations" className={pathname === '/locations' ? 'active' : ''}>Locations</Link>
        <Link href="/join" className={pathname === '/join' ? 'active' : ''}>Join</Link>
      </div>
    </nav>
  );
}
