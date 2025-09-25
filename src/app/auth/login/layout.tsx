import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Acadex',
  description: 'Sign in to your Acadex account to continue learning English with interactive courses and quizzes.',
  alternates: {
    canonical: 'https://acadex.academy/auth/login',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
