import { AdminSidebar } from '@/components/admin/AdminSidebar'
import AdminRoute from '@/components/AdminRoute'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminRoute>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminRoute>
  )
}
