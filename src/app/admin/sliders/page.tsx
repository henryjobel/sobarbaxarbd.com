'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'
import Image from 'next/image'

interface Slide {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  buttonText: string
  buttonLink: string
  image: string
  bgColor: string | null
  textColor: string
  order: number
  isActive: boolean
}

const emptyForm = {
  title: '', subtitle: '', description: '',
  buttonText: 'Shop Now', buttonLink: '/shop',
  image: '', bgColor: '#1a1a1a', textColor: '#ffffff',
  isActive: true,
}

export default function AdminSlidersPage() {
  const { token } = useAdminAuth()
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Slide | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)

  const fetchSlides = () => {
    fetch('/api/v1/slides')
      .then(r => r.json())
      .then(res => { if (res.success) setSlides(res.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSlides() }, [])

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setError(''); setShowForm(true) }

  const openEdit = (s: Slide) => {
    setEditTarget(s)
    setForm({
      title: s.title,
      subtitle: s.subtitle ?? '',
      description: s.description ?? '',
      buttonText: s.buttonText,
      buttonLink: s.buttonLink,
      image: s.image,
      bgColor: s.bgColor ?? '#1a1a1a',
      textColor: s.textColor,
      isActive: s.isActive,
    })
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const url = editTarget ? `/api/v1/slides/${editTarget.id}` : '/api/v1/slides'
    const method = editTarget ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      fetchSlides()
      setShowForm(false)
      setEditTarget(null)
    } else {
      setError(data.message || 'Failed to save slide')
    }
    setSaving(false)
  }

  const handleToggle = async (s: Slide) => {
    const res = await fetch(`/api/v1/slides/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !s.isActive }),
    })
    if ((await res.json()).success) setSlides(prev => prev.map(x => x.id === s.id ? { ...x, isActive: !s.isActive } : x))
  }

  const moveOrder = async (s: Slide, dir: -1 | 1) => {
    const newOrder = s.order + dir
    if (newOrder < 0) return
    await fetch(`/api/v1/slides/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ order: newOrder }),
    })
    fetchSlides()
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete slide "${title}"?`)) return
    const res = await fetch(`/api/v1/slides/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if ((await res.json()).success) setSlides(prev => prev.filter(s => s.id !== id))
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hero Sliders</h1>
            <p className="text-gray-500 text-sm">{slides.length} slides — shown on homepage hero section</p>
          </div>
          <button onClick={openCreate}
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            + Add Slide
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl my-auto">
              <h2 className="font-semibold text-lg mb-4">{editTarget ? 'Edit Slide' : 'Add Slide'}</h2>
              {error && <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                    <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Summer Sale Collections" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
                    <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Sale! Up To 50% Off!" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Optional longer description text" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                    <input value={form.buttonText} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Button Link</label>
                    <input value={form.buttonLink} onChange={e => setForm(f => ({ ...f, buttonLink: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="/shop" />
                  </div>
                  <div className="col-span-2">
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Background Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                        className="w-10 h-9 border rounded cursor-pointer" />
                      <input value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                        className="w-10 h-9 border rounded cursor-pointer" />
                      <input value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />
                      <span className="text-sm font-medium text-gray-700">Active (visible on site)</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                    {saving ? 'Saving...' : editTarget ? 'Update Slide' : 'Add Slide'}
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

        {/* Slides List */}
        <div className="space-y-3">
          {loading
            ? [...Array(2)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl animate-pulse shadow-sm" />)
            : slides.length === 0
              ? <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
                  No slides yet. Add your first slide.
                </div>
              : slides.map((s, idx) => (
                  <div key={s.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex items-stretch">
                    <div className="w-40 h-28 relative flex-shrink-0 bg-gray-100">
                      {s.image && <Image src={s.image} alt={s.title} fill className="object-cover" unoptimized />}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded">#{s.order}</span>
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{s.title}</p>
                        {s.subtitle && <p className="text-sm text-gray-500 mt-0.5">{s.subtitle}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">→ {s.buttonText} ({s.buttonLink})</span>
                          <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: s.bgColor ?? '#1a1a1a' }} title="bg color" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => moveOrder(s, -1)} disabled={idx === 0}
                            className="text-gray-400 hover:text-gray-700 text-xs px-2 py-0.5 border rounded disabled:opacity-30">▲</button>
                          <button onClick={() => moveOrder(s, 1)} disabled={idx === slides.length - 1}
                            className="text-gray-400 hover:text-gray-700 text-xs px-2 py-0.5 border rounded disabled:opacity-30">▼</button>
                        </div>
                        <button onClick={() => handleToggle(s)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition ${s.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                        <button onClick={() => handleDelete(s.id, s.title)} className="text-red-500 hover:underline text-xs font-medium">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
        </div>
      </div>
    </AdminGuard>
  )
}
