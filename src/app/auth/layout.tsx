import { Metadata } from 'next'

// This will be inherited by auth pages unless they override it
export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: {
      canonical: 'https://acadex.academy/auth',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}