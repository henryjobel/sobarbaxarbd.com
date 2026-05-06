'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  token: string | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  isLoading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    if (stored) {
      setToken(stored)
      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${stored}` },
      })
        .then(r => r.json())
        .then(res => {
          if (res.success && res.data.role === 'admin') {
            setUser(res.data)
          } else {
            localStorage.removeItem('admin_token')
            setToken(null)
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!data.success) return { error: data.message || 'Login failed' }
    if (data.data.user.role !== 'admin') return { error: 'Access denied. Admin only.' }

    localStorage.setItem('admin_token', data.data.token)
    setToken(data.data.token)
    setUser(data.data.user)
    return {}
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setUser(null)
    router.push('/admin/login')
  }

  return (
    <AdminAuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
