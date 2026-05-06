'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'
import Image from 'next/image'

interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  image: string
  link: string | null
  position: string
  order: number
  isActive: boolean
}

const POSITIONS = [
  { value: 'home', label: 'Homepage' },
  { value: 'shop', label: 'Shop Page' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'product', label: 'Product Page' },
]

const emptyForm = { title: '', subtitle: '', image: '', link: '', position: 'home', isActive: true }

export default function AdminBannersPage() {
  const { token } = useAdminAuth()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [activePosition, setActivePosition] = useState('home')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Banner | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ ...emptyForm })

  const fetchBanners = () => {
    setLoading(true)
    fetch('/api/v1/banners')
      .then(r => r.json())
      .then(res => { if (res.success) setBanners(res.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBanners() }, [])

  const filtered = banners.filter(b => b.position === activePosition)

  const openCreate = () => {
    setEditTarget(null)
    setForm({ ...emptyForm, position: activePosition })
    setError('')
    setShowForm(true)
  }

  const openEdit = (b: Banner) => {
    setEditTarget(b)
    setForm({ title: b.title ?? '', subtitle: b.subtitle ?? '', image: b.image, link: b.link ?? '', position: b.position, isActive: b.isActive })
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const url = editTarget ? `/api/v1/banners/${editTarget.id}` : '/api/v1/banners'
    const method = editTarget ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      fetchBanners()
      setShowForm(false)
      setEditTarget(null)
    } else {
      setError(data.message || 'Failed to save banner')
    }
    setSaving(false)
  }

  const handleToggle = async (b: Banner) => {
    const res = await fetch(`/api/v1/banners/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !b.isActive }),
    })
    if ((await res.json()).success) setBanners(prev => prev.map(x => x.id === b.id ? { ...x, isActive: !b.isActive } : x))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    const res = await fetch(`/api/v1/banners/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if ((await res.json()).success) setBanners(prev => prev.filter(b => b.id !== id))
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
            <p className="text-gray-500 text-sm">Promotional banners for different page positions</p>
          </div>
          <button onClick={openCreate}
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            + Add Banner
          </button>
        </div>

        {/* Position Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {POSITIONS.map(p => (
            <button key={p.value} onClick={() => setActivePosition(p.value)}
              className={`px-4 py-2 text-sm font-medium transition -mb-px border-b-2 ${activePosition === p.value ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {p.label}
              <span className="ml-1.5 text-xs text-gray-400">({banners.filter(b => b.position === p.value).length})</span>
            </button>
          ))}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg my-auto">
              <h2 className="font-semibold text-lg mb-4">{editTarget ? 'Edit Banner' : 'Add Banner'}</h2>
              {error && <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image URL *</label>
                  <input required value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://... or /images/..." />
                  {form.image && (
                    <div className="mt-2 h-32 rounded-lg overflow-hidden bg-gray-100 relative">
                      <Image src={form.image} alt="preview" fill className="object-cover" unoptimized />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Optional heading text" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
                  <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Optional subtitle" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Link URL</label>
                  <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="/shop or https://..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                  <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                    {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                    {saving ? 'Saving...' : editTarget ? 'Update' : 'Add Banner'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditTarget(null) }}
                    className="flex-1 border py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Banners Grid */}
        {loading
          ? <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-xl animate-pulse shadow-sm" />)}</div>
          : filtered.length === 0
            ? <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">No banners for this position yet.</div>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(b => (
                  <div key={b.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="h-40 bg-gray-100 relative">
                      {b.image && <Image src={b.image} alt={b.title ?? 'banner'} fill className="object-cover" unoptimized />}
                    </div>
                    <div className="p-3">
                      {b.title && <p className="font-medium text-sm text-gray-900">{b.title}</p>}
                      {b.subtitle && <p className="text-xs text-gray-500">{b.subtitle}</p>}
                      {b.link && <p className="text-xs text-blue-500 mt-1 truncate">{b.link}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => handleToggle(b)}
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button onClick={() => openEdit(b)} className="text-blue-600 text-xs font-medium hover:underline ml-auto">Edit</button>
                        <button onClick={() => handleDelete(b.id)} className="text-red-500 text-xs font-medium hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
        }
      </div>
    </AdminGuard>
  )
}
