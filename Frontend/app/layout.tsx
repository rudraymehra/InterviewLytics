import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InterviewLytics - AI-Powered Hiring Platform',
  description: 'Revolutionize your hiring process with our AI-driven platform. Automate interviews, analyze resumes, and make data-driven hiring decisions.',
  keywords: 'AI hiring, recruitment, interview automation, resume analysis, talent acquisition',
  authors: [{ name: 'InterviewLytics Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://interviewlytics.com'),
  openGraph: {
    title: 'InterviewLytics - AI-Powered Hiring Platform',
    description: 'Revolutionize your hiring process with our AI-driven platform.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterviewLytics - AI-Powered Hiring Platform',
    description: 'Revolutionize your hiring process with our AI-driven platform.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
