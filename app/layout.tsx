import type { Metadata } from 'next'
import './globals.css'
import '../styles/mobile-hide.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'SenseiFi - AI-Powered Trading Intelligence',
  description: 'Join the waiting list for SenseiFi - AI-powered trading intelligence, security tools, and exclusive launch benefits.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a1a]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

