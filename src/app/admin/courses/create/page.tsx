'use client'

import { useRouter } from 'next/navigation'
import { CourseBuilderRouter } from '@/components/admin/CourseBuilderRouter'

export default function CreateCoursePage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/courses')
  }

  const handleClose = () => {
    router.push('/admin/courses')
  }

  return (
    <CourseBuilderRouter
      course={null}
      isOpen={true}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}

