import './globals.css';
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';

export const metadata = { title: 'KM Wiki', description: '김민석 LLM Wiki' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="layout">
          <Sidebar />
          <main className="main">
            <div className="content">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
