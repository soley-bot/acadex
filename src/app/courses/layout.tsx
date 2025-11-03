import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Courses - Acadex Academy',
  description: 'Browse our collection of expert-led English learning courses. Master IELTS, grammar, vocabulary, and speaking skills with interactive lessons.',
  keywords: ['online courses', 'english learning', 'IELTS courses', 'language courses', 'education'],
  alternates: {
    canonical: 'https://acadex.academy/courses',
  },
  openGraph: {
    title: 'Online Courses - Acadex Academy',
    description: 'Browse our collection of expert-led English learning courses.',
    url: 'https://acadex.academy/courses',
    siteName: 'Acadex',
    type: 'website',
  },
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
