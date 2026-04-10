import type { Metadata } from 'next'
import './globals.css'
import '../styles/mobile-hide.css'
import { Providers } from './providers'
import logoIcon from '@/assets/images/logo.png'

export const metadata: Metadata = {
  title: 'SenseiFi - AI-Powered Trading Intelligence',
  description: 'Join the waiting list for SenseiFi - AI-powered trading intelligence, security tools, and exclusive launch benefits.',
  other: {
    'base:app_id': '69d8831234c69936dc95d6b2',
  },
  icons: {
    icon: [
      { url: logoIcon.src, type: 'image/png' },
    ],
    shortcut: [{ url: logoIcon.src }],
    apple: [{ url: logoIcon.src }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-[#0a0a1a] h-full overflow-hidden">
        <div className="root-scroll h-full min-h-screen">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}

