// =============================================
// Navigation Bar Component
// =============================================
// Top navigation with logo and links

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_CONTENT } from '@/config/content';
import { cn } from '@/lib/utils';
import PlayerStats from '@/components/PlayerStats';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation links
  const navLinks = [
    { href: '/', label: APP_CONTENT.nav.home },
    { href: '/history', label: APP_CONTENT.nav.history },
    { href: '/analytics', label: 'Analytics' },
  ];

  return (
    <nav className="relative z-20 px-4 py-4 sm:px-6 md:px-8 lg:px-12">
      <div className="flex justify-between items-center">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 group"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Keep icon more prominent on tablet/phone, then normalize on desktop */}
        <span className="text-3xl md:text-4xl lg:text-2xl transition-transform group-hover:scale-105">
          {APP_CONTENT.icon}
        </span>
        <span className="hidden lg:inline text-xl font-bold text-primary group-hover:text-primary-dark transition-colors">
          {APP_CONTENT.name}
        </span>
      </Link>

      {/* Mobile: player stats + menu button */}
      <div className="flex items-center gap-2 md:hidden">
        <PlayerStats />
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-primary hover:bg-primary/5 shadow-clay-sm transition-colors"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="text-lg leading-none">{isMobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Tablet/Desktop: nav links + player stats */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm p-1.5 shadow-clay-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-gradient-to-b from-primary-light to-primary text-white shadow-[0_3px_0_#5b21b6,inset_0_1px_2px_rgba(255,255,255,0.5)]'
                    : 'text-ink-soft hover:text-primary hover:bg-primary/5'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <PlayerStats />
      </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 rounded-clay-sm bg-white/95 backdrop-blur-sm shadow-clay-md p-2 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block w-full px-4 py-3 rounded-full text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-gradient-to-b from-primary-light to-primary text-white shadow-[0_3px_0_#5b21b6,inset_0_1px_2px_rgba(255,255,255,0.5)]'
                    : 'text-ink-soft hover:text-primary hover:bg-primary/5'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
