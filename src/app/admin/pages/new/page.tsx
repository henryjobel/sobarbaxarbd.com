'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '../../AdminAuthContext'
import AdminGuard from '../../components/AdminGuard'
import PageEditor from '../_components/PageEditor'

export default function NewPage() {
  const { token } = useAdminAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true)
    setError('')
    const res = await fetch('/api/v1/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.success) {
      router.push('/admin/pages')
    } else {
      setError(json.message || 'Failed to create page')
      setSaving(false)
    }
  }

  return (
    <AdminGuard>
      <PageEditor
        mode="create"
        saving={saving}
        error={error}
        onSave={handleSave}
        onCancel={() => router.push('/admin/pages')}
      />
    </AdminGuard>
  )
}
