'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, UserProfile } from '@/lib/api'

interface AuthContextProps {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    phone?: string
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (data: Partial<{
    firstName: string
    lastName: string
    phone: string
    password: string
  }>) => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const profile = await authApi.getMe()
      setUser(profile)
    } catch {
      localStorage.removeItem('access_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email: string, password: string) => {
    const { token, user: rawUser } = await authApi.login({ email, password })
    localStorage.setItem('access_token', token)
    setUser(rawUser)
  }

  const register = async (data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    phone?: string
  }) => {
    const { token, user: rawUser } = await authApi.register(data)
    localStorage.setItem('access_token', token)
    setUser(rawUser)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    router.push('/')
  }

  const refreshUser = async () => {
    try {
      const profile = await authApi.getMe()
      setUser(profile)
    } catch {
      logout()
    }
  }

  const updateProfile = async (data: Partial<{
    firstName: string
    lastName: string
    phone: string
    password: string
  }>) => {
    await authApi.updateMe(data)
    await refreshUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
