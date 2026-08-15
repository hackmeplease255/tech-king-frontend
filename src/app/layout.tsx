import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Outfit, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Tech King Automation',
  description: 'Fast. Free. Smart. Reliable. — WhatsApp automation platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
