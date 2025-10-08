/**
 * @file layout.tsx
 * @description 루트 레이아웃
 * 성능 최적화: 폰트 최적화, 메타데이터
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// ============================================================================
// Font Optimization
// ============================================================================

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'V-A 감정 공간 시각화',
  description: 'Valence-Arousal 2차원 감정 분석 시스템 - Warriner × NRC VAD',
  keywords: ['emotion', 'valence', 'arousal', 'VAD', 'visualization', 'sentiment analysis'],
  authors: [{ name: 'VEATIC Research Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#3B82F6',
};

// ============================================================================
// Root Layout
// ============================================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Performance optimizations */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.googleapis.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

