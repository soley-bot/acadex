// Course form constants and types
export const categories = [
  'Programming',
  'Data Science',
  'Design',
  'Business',
  'Marketing',
  'Language',
  'Music',
  'Photography',
  'Health & Fitness',
  'Other'
]

export const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
] as const

export const statuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
] as const

export type CourseLevel = typeof levels[number]['value']
export type CourseStatus = typeof statuses[number]['value']
