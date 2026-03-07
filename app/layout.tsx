import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'vibeDSM',
  description: 'Build with AI. Ship with local builders.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grid-overlay" />
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
