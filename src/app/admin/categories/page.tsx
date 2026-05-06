'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  _count?: { products: number }
}

export default function AdminCategoriesPage() {
  const { token } = useAdminAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = () => {
    fetch('/api/v1/categories')
      .then(r => r.json())
      .then(res => { if (res.success) setCategories(res.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => { setEditTarget(null); setForm({ name: '', slug: '', description: '' }); setError(''); setShowForm(true) }
  const openEdit = (cat: Category) => { setEditTarget(cat); setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '' }); setError(''); setShowForm(true) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError('')
    const url = editTarget ? `/api/v1/categories/${editTarget.id}` : '/api/v1/categories'
    const method = editTarget ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      fetchCategories()
      setShowForm(false)
    } else {
      setError(data.message || 'Failed to save category')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will become uncategorized.`)) return
    await fetch(`/api/v1/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setCategories(c => c.filter(cat => cat.id !== id))
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 text-sm">{categories.length} categories</p>
          </div>
          <button onClick={openCreate} className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            + Add Category
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">{editTarget ? 'Edit Category' : 'New Category'}</h2>
              {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm mb-4">{error}</div>}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Slug</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Products</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i}>{[...Array(4)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                : categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-5 py-4 text-gray-500">{cat.slug}</td>
                      <td className="px-5 py-4 text-gray-500">{cat._count?.products ?? 0}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <button onClick={() => openEdit(cat)} className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                          <button onClick={() => handleDelete(cat.id, cat.name)} className="text-red-500 hover:underline text-xs font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  )
}
