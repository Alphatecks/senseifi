import type { Metadata } from 'next'
import './globals.css'
import '../styles/mobile-hide.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'SenseiFi - AI-Powered Trading Intelligence',
  description: 'Join the waiting list for SenseiFi - AI-powered trading intelligence, security tools, and exclusive launch benefits.',
  other: {
    'base:app_id': '69e4887887970a2e83bef35d',
  },
  icons: {
    icon: '/images/scaled_logo.png',
    shortcut: '/images/scaled_logo.png',
    apple: '/images/scaled_logo.png',
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

