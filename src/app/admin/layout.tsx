import type { Metadata } from 'next'
import { AdminAuthProvider } from './AdminAuthContext'
import '../../../src/styles/globals.scss'

export const metadata: Metadata = {
  title: 'Anvogue Admin',
  description: 'Admin Dashboard',
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  )
}
