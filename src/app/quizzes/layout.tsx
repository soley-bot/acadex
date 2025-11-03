import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice Quizzes - Acadex Academy',
  description: 'Test your English skills with interactive quizzes. Practice IELTS, grammar, vocabulary, reading comprehension, and more.',
  keywords: ['english quizzes', 'IELTS practice', 'grammar quiz', 'vocabulary test', 'online tests'],
  alternates: {
    canonical: 'https://acadex.academy/quizzes',
  },
  openGraph: {
    title: 'Practice Quizzes - Acadex Academy',
    description: 'Test your English skills with interactive quizzes.',
    url: 'https://acadex.academy/quizzes',
    siteName: 'Acadex',
    type: 'website',
  },
}

export default function QuizzesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
