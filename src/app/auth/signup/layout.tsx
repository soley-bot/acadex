import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - Acadex',
  description: 'Create your Acadex account to start learning English with expert-led courses and interactive quizzes.',
  alternates: {
    canonical: 'https://acadex.academy/auth/signup',
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}