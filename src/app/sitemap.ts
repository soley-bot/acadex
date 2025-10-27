import { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/api-auth'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://acadex.academy'
  const currentDate = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quizzes`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    const supabase = createServiceClient()

    // Fetch published courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(1000) // Reasonable limit for sitemap

    // Fetch published quizzes
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(1000) // Reasonable limit for sitemap

    // Add course pages
    const coursePages: MetadataRoute.Sitemap = (courses || []).map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: new Date(course.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Add quiz pages
    const quizPages: MetadataRoute.Sitemap = (quizzes || []).map((quiz) => ({
      url: `${baseUrl}/quizzes/${quiz.id}`,
      lastModified: new Date(quiz.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...coursePages, ...quizPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages if database fetch fails
    return staticPages
  }
}
