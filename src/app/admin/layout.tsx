import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import AdminLayoutClient from './admin-layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check - blocks unauthorized access before rendering
  const user = await requireAdmin()

  if (!user) {
    redirect('/auth?tab=signin')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}

