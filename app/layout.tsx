// =============================================
// Root Layout
// =============================================
// Main layout wrapper for the entire app

import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { APP_CONTENT } from '@/config/content';

// Load Outfit font from Google Fonts
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-main',
});

// Page metadata
export const metadata: Metadata = {
  title: APP_CONTENT.name,
  description: APP_CONTENT.subtitle,
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="min-h-screen">
        {/* Background decorations */}
        <div className="bg-decoration" aria-hidden="true" />
        <div className="bg-decoration-2" aria-hidden="true" />

        {/* Navigation bar */}
        <Navbar />

        {/* Main content */}
        <main className="relative z-10">{children}</main>

        {/* Footer */}
        <footer className="relative z-10 text-center py-8 text-gray-500 text-sm">
          <p>
            {APP_CONTENT.footer.replace('♥', '')}
            <span className="text-accent">♥</span>
            {APP_CONTENT.footer.split('♥')[1] || ''}
          </p>
        </footer>
      </body>
    </html>
  );
}
