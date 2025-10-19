import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check - blocks unauthorized access before rendering
  const user = await requireAuth()
  
  if (!user) {
    redirect('/auth/login')
  }

  return <>{children}</>
}
