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

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 border-primary/25 bg-white text-primary hover:bg-primary/5 shadow-[2px_2px_0_rgba(124,58,237,0.15)] transition-colors"
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
      >
        <span className="text-lg leading-none">{isMobileMenuOpen ? '✕' : '☰'}</span>
      </button>

      {/* Tablet/Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-1 rounded-xl bg-white/85 backdrop-blur-sm border-2 border-primary/15 p-1.5 shadow-[3px_3px_0_rgba(124,58,237,0.1)]">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-semibold transition-all border-2',
                isActive
                  ? 'bg-primary/10 border-primary/30 text-primary shadow-[2px_2px_0_rgba(124,58,237,0.12)]'
                  : 'border-transparent text-gray-500 hover:text-primary hover:bg-primary/5'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 rounded-xl border-2 border-primary/15 bg-white/95 backdrop-blur-sm shadow-[3px_3px_0_rgba(124,58,237,0.12)] p-2 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block w-full px-4 py-3 rounded-lg text-sm font-semibold transition-colors border-2',
                  isActive
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary hover:bg-primary/5'
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
