import { Metadata } from 'next'
import { createServiceClient } from '@/lib/api-auth'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const baseUrl = 'https://acadex.academy'
  const quizUrl = `${baseUrl}/quizzes/${resolvedParams.id}`

  try {
    const supabase = createServiceClient()
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id, title, description, cover_image_url, category')
      .eq('id', resolvedParams.id)
      .eq('is_published', true)
      .single()

    if (!quiz) {
      return {
        title: 'Quiz Not Found - Acadex',
        description: 'The quiz you are looking for does not exist.',
        alternates: {
          canonical: quizUrl,
        },
      }
    }

    return {
      title: `${quiz.title} - Acadex Quiz`,
      description: quiz.description || 'Test your knowledge with interactive quizzes on Acadex Academy',
      alternates: {
        canonical: quizUrl,
      },
      openGraph: {
        title: quiz.title,
        description: quiz.description || 'Test your knowledge with interactive quizzes on Acadex Academy',
        url: quizUrl,
        siteName: 'Acadex',
        images: quiz.cover_image_url ? [
          {
            url: quiz.cover_image_url,
            width: 1200,
            height: 630,
            alt: quiz.title,
          },
        ] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: quiz.title,
        description: quiz.description || 'Test your knowledge with interactive quizzes on Acadex Academy',
        images: quiz.cover_image_url ? [quiz.cover_image_url] : [],
      },
    }
  } catch (error) {
    console.error('Error generating quiz metadata:', error)
    return {
      title: 'Quiz - Acadex',
      description: 'Interactive quiz on Acadex Academy',
      alternates: {
        canonical: quizUrl,
      },
    }
  }
}

export default function QuizLayout({ children }: Props) {
  return <>{children}</>
}
