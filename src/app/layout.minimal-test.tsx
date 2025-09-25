import type { Metadata } from 'next'
import ErrorBoundary from '../components/ErrorBoundary'
import { SimpleToaster } from '../components/SimpleToaster'
import { QueryProvider } from '@/providers/QueryProvider'

// Global styles  
import './globals.css'

export const metadata: Metadata = {
  title: 'Acadex - Learn & Practice',
  description: 'Modern platform for quiz practice and online course enrollment.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <QueryProvider>
            <div>Testing ErrorBoundary + QueryProvider</div>
            {children}
          </QueryProvider>
        </ErrorBoundary>
        <SimpleToaster />
      </body>
    </html>
  )
}
