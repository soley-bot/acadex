import type { Metadata } from 'next'
import CleanErrorBoundary from '../components/ErrorBoundary.clean'
import { SimpleToaster } from '../components/SimpleToaster'
import { CleanQueryProvider } from '@/providers/QueryProvider.clean'

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
        <CleanErrorBoundary>
          <CleanQueryProvider>
            <div>Testing Clean ErrorBoundary + Clean QueryProvider</div>
            {children}
          </CleanQueryProvider>
        </CleanErrorBoundary>
        <SimpleToaster />
      </body>
    </html>
  )
}