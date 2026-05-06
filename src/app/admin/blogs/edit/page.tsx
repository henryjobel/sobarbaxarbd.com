'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAdminAuth } from '../../AdminAuthContext'
import AdminGuard from '../../components/AdminGuard'

export default function EditBlogPage() {
  const { token } = useAdminAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') ?? ''

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', slug: '', category: '', tag: '', author: '',
    thumbImg: '', coverImg: '', shortDesc: '', description: '', published: false,
  })

  useEffect(() => {
    if (!slug) return
    fetch(`/api/v1/blogs/${slug}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const b = res.data
          setForm({
            title: b.title ?? '',
            slug: b.slug ?? '',
            category: b.category ?? '',
            tag: b.tag ?? '',
            author: b.author ?? '',
            thumbImg: b.thumbImg ?? '',
            coverImg: b.coverImg ?? '',
            shortDesc: b.shortDesc ?? '',
            description: b.description ?? '',
            published: b.published ?? false,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError('')
    const res = await fetch(`/api/v1/blogs/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      router.push('/admin/blogs')
    } else {
      setError(data.message || 'Failed to update blog post')
      setSaving(false)
    }
  }

  if (loading) return <AdminGuard><div className="p-8 text-gray-500">Loading...</div></AdminGuard>

  return (
    <AdminGuard>
      <div className="p-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <input value={form.tag} onChange={e => set('tag', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input value={form.author} onChange={e => set('author', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URL</label>
              <input value={form.thumbImg} onChange={e => set('thumbImg', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input value={form.coverImg} onChange={e => set('coverImg', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea rows={2} value={form.shortDesc} onChange={e => set('shortDesc', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea required rows={10} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="published" checked={form.published} onChange={e => set('published', e.target.checked)} className="w-4 h-4" />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </AdminGuard>
  )
}
