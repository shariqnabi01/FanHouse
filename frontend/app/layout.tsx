import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { RealtimeNotifications } from '@/components/realtime-notifications'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FanHouse - Creator Platform',
  description: 'A platform for creators and fans',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <RealtimeNotifications />
        </AuthProvider>
      </body>
    </html>
  )
}

