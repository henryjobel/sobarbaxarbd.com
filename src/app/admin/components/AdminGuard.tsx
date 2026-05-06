'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '../AdminAuthContext'
import AdminSidebar from './AdminSidebar'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
