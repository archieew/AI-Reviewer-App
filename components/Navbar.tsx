// =============================================
// Navigation Bar Component
// =============================================
// Top navigation with logo and links

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_CONTENT } from '@/config/content';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  // Navigation links
  const navLinks = [
    { href: '/', label: APP_CONTENT.nav.home },
    { href: '/history', label: APP_CONTENT.nav.history },
  ];

  return (
    <nav className="relative z-10 flex justify-between items-center px-6 py-4 md:px-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-2xl">{APP_CONTENT.icon}</span>
        <span className="text-xl font-bold text-primary group-hover:text-primary-dark transition-colors">
          {APP_CONTENT.name}
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-primary'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
