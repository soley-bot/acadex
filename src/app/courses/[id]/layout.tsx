import { Metadata } from 'next'
import { createServiceClient } from '@/lib/api-auth'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const baseUrl = 'https://acadex.academy'
  const courseUrl = `${baseUrl}/courses/${resolvedParams.id}`

  try {
    const supabase = createServiceClient()
    const { data: course } = await supabase
      .from('courses')
      .select('id, title, description, cover_image_url')
      .eq('id', resolvedParams.id)
      .eq('is_published', true)
      .single()

    if (!course) {
      return {
        title: 'Course Not Found - Acadex',
        description: 'The course you are looking for does not exist.',
        alternates: {
          canonical: courseUrl,
        },
      }
    }

    return {
      title: `${course.title} - Acadex Academy`,
      description: course.description || 'Learn with expert-led courses on Acadex Academy',
      alternates: {
        canonical: courseUrl,
      },
      openGraph: {
        title: course.title,
        description: course.description || 'Learn with expert-led courses on Acadex Academy',
        url: courseUrl,
        siteName: 'Acadex',
        images: course.cover_image_url ? [
          {
            url: course.cover_image_url,
            width: 1200,
            height: 630,
            alt: course.title,
          },
        ] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: course.title,
        description: course.description || 'Learn with expert-led courses on Acadex Academy',
        images: course.cover_image_url ? [course.cover_image_url] : [],
      },
    }
  } catch (error) {
    console.error('Error generating course metadata:', error)
    return {
      title: 'Course - Acadex',
      description: 'Online course on Acadex Academy',
      alternates: {
        canonical: courseUrl,
      },
    }
  }
}

export default function CourseLayout({ children }: Props) {
  return <>{children}</>
}
