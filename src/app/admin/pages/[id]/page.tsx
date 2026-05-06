'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '../../AdminAuthContext'
import AdminGuard from '../../components/AdminGuard'
import PageEditor from '../_components/PageEditor'

interface PageData {
  id: string; title: string; slug: string; content: string | null
  excerpt: string | null; status: string; template: string
  metaTitle: string | null; metaDesc: string | null
}

export default function EditPageRoute() {
  const { token } = useAdminAuth()
  const router = useRouter()
  const params = useParams()
  const pageId = params.id as string

  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    // We use _admin=1 to get all pages then find by id
    fetch('/api/v1/pages?_admin=1', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(async res => {
        if (res.success) {
          const found = res.data.find((p: PageData) => p.id === pageId)
          if (found) {
            // Fetch full page content by slug
            const full = await fetch(`/api/v1/pages/${found.slug}?_admin=1`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json())
            setPage(full.success ? full.data : found)
          } else {
            setError('Page not found')
          }
        }
      })
      .catch(() => setError('Failed to load page'))
      .finally(() => setLoading(false))
  }, [token, pageId])

  const handleSave = async (data: Record<string, unknown>) => {
    if (!page) return
    setSaving(true)
    setError('')
    const res = await fetch(`/api/v1/pages/${page.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.success) {
      setPage(json.data)
      setSaving(false)
    } else {
      setError(json.message || 'Failed to update page')
      setSaving(false)
    }
  }

  if (loading) return <AdminGuard><div className="p-8 text-gray-400">Loading page...</div></AdminGuard>

  return (
    <AdminGuard>
      {page ? (
        <PageEditor
          mode="edit"
          initial={{
            title: page.title,
            slug: page.slug,
            content: page.content ?? '',
            excerpt: page.excerpt ?? '',
            status: page.status,
            template: page.template,
            metaTitle: page.metaTitle ?? '',
            metaDesc: page.metaDesc ?? '',
          }}
          saving={saving}
          error={error}
          onSave={handleSave}
          onCancel={() => router.push('/admin/pages')}
        />
      ) : (
        <div className="p-8 text-red-500">{error}</div>
      )}
    </AdminGuard>
  )
}
