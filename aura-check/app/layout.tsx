import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Aura Check — Discover Your Aura. Analyze Your Face.',
  description: 'AI-powered face analysis and aura reading. Get your scores, discover your energy, and share your results.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-aura-darker text-white font-body antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
