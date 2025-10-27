import { Metadata } from 'next'
import { createServiceClient } from '@/lib/api-auth'

interface CourseLayoutProps {
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
    const { data: course } = await supabase
      .from('courses')
      .select('title, description, image_url, category, level, instructor_name, student_count, rating')
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (!course) {
      return {
        title: 'Course Not Found',
        description: 'The course you are looking for does not exist.',
      }
    }

    const baseUrl = 'https://acadex.academy'
    const courseUrl = `${baseUrl}/courses/${id}`

    return {
      title: `${course.title} | Acadex`,
      description: course.description || `Learn ${course.title} with ${course.instructor_name}. ${course.level} level course.`,
      keywords: [
        course.title,
        course.category,
        course.level,
        'online course',
        'english learning',
        course.instructor_name,
      ],
      openGraph: {
        title: course.title,
        description: course.description || `Learn ${course.title}`,
        url: courseUrl,
        siteName: 'Acadex',
        images: course.image_url
          ? [
              {
                url: course.image_url,
                width: 1200,
                height: 630,
                alt: course.title,
              },
            ]
          : [
              {
                url: '/og-image-ielts.png',
                width: 1200,
                height: 630,
                alt: 'Acadex - English Learning Platform',
              },
            ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: course.title,
        description: course.description || `Learn ${course.title}`,
        images: course.image_url ? [course.image_url] : ['/og-image-ielts.png'],
      },
      alternates: {
        canonical: courseUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    console.error('Error generating course metadata:', error)
    return {
      title: 'Course | Acadex',
      description: 'Online course on Acadex',
    }
  }
}

export default function CourseLayout({ children }: CourseLayoutProps) {
  return <>{children}</>
}
