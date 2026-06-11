import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EDA Studio — Intelligent Dataset Explorer',
  description:
    'Drop any dataset. Get a beautiful analysis dashboard with hidden pattern detection and exportable notebook code.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
