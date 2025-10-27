import { Metadata } from 'next'
import { createServiceClient } from '@/lib/api-auth'

interface QuizLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const supabase = createServiceClient()
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('title, description, category, difficulty, duration_minutes, total_questions, image_url')
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (!quiz) {
      return {
        title: 'Quiz Not Found',
        description: 'The quiz you are looking for does not exist.',
      }
    }

    const baseUrl = 'https://acadex.academy'
    const quizUrl = `${baseUrl}/quizzes/${id}`

    return {
      title: `${quiz.title} | Acadex Quiz`,
      description: quiz.description || `Test your knowledge with ${quiz.title}. ${quiz.total_questions} questions, ${quiz.duration_minutes} minutes, ${quiz.difficulty} level.`,
      keywords: [
        quiz.title,
        quiz.category,
        quiz.difficulty,
        'quiz',
        'practice test',
        'english test',
        'online quiz',
      ],
      openGraph: {
        title: quiz.title,
        description: quiz.description || `Test your knowledge with ${quiz.title}`,
        url: quizUrl,
        siteName: 'Acadex',
        images: quiz.image_url
          ? [
              {
                url: quiz.image_url,
                width: 1200,
                height: 630,
                alt: quiz.title,
              },
            ]
          : [
              {
                url: '/og-image-ielts.png',
                width: 1200,
                height: 630,
                alt: 'Acadex - Quiz Practice',
              },
            ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: quiz.title,
        description: quiz.description || `Test your knowledge with ${quiz.title}`,
        images: quiz.image_url ? [quiz.image_url] : ['/og-image-ielts.png'],
      },
      alternates: {
        canonical: quizUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    console.error('Error generating quiz metadata:', error)
    return {
      title: 'Quiz | Acadex',
      description: 'Online quiz on Acadex',
    }
  }
}

export default function QuizLayout({ children }: QuizLayoutProps) {
  return <>{children}</>
}
