import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import Provider from '@/components/Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'talk Pdf ai',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <Provider>
        <html lang="en">
          <body className={inter.className}>
          <Toaster position='top-center'/>
          {children}
          </body>
        </html>
      </Provider>
    </ClerkProvider>
  )
}
