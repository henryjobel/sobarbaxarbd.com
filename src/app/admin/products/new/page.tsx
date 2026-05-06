'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '../../AdminAuthContext'
import AdminGuard from '../../components/AdminGuard'

interface Category { id: string; name: string }
interface Variation { color: string; colorCode: string; colorImage: string; image: string }

const PRODUCT_TYPES = ['fashion', 'cosmetic', 'furniture', 'jewelry', 'organic', 'pet', 'toys', 'underwear', 'watch', 'yoga', 'marketplace']

export default function NewProductPage() {
  const { token } = useAdminAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', originPrice: '',
    categoryId: '', type: '', gender: 'unisex', brand: '',
    quantity: '', isNew: false, onSale: false, status: 'active', action: '',
  })

  // Images
  const [thumbImages, setThumbImages] = useState<string[]>([''])
  const [galleryImages, setGalleryImages] = useState<string[]>([''])

  // Sizes
  const [sizes, setSizes] = useState<string[]>([])
  const [sizeInput, setSizeInput] = useState('')

  // Variations (colors)
  const [variations, setVariations] = useState<Variation[]>([])
  const [newVariation, setNewVariation] = useState<Variation>({ color: '', colorCode: '#000000', colorImage: '', image: '' })

  useEffect(() => {
    fetch('/api/v1/categories').then(r => r.json()).then(res => { if (res.success) setCategories(res.data) })
  }, [])

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))

  const addSize = () => {
    const s = sizeInput.trim().toUpperCase()
    if (s && !sizes.includes(s)) { setSizes([...sizes, s]); setSizeInput('') }
  }

  const addVariation = () => {
    if (!newVariation.color) return
    setVariations([...variations, { ...newVariation }])
    setNewVariation({ color: '', colorCode: '#000000', colorImage: '', image: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setError('')

    const thumbImage = thumbImages.filter(Boolean)
    const images = galleryImages.filter(Boolean)

    const res = await fetch('/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        originPrice: form.originPrice ? Number(form.originPrice) : undefined,
        quantity: Number(form.quantity || 0),
        thumbImage,
        images,
        sizes,
        variations,
      }),
    })
    const data = await res.json()
    if (data.success) {
      router.push('/admin/products')
    } else {
      setError(data.message || 'Failed to create product')
      setLoading(false)
    }
  }

  return (
    <AdminGuard>
      <div className="p-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated from name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (৳) *</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (৳)</label>
                <input type="number" min="0" step="0.01" value={form.originPrice} onChange={e => set('originPrice', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input value={form.brand} onChange={e => set('brand', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="">Select type</option>
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="unisex">Unisex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Label</label>
                <input value={form.action} onChange={e => set('action', e.target.value)} placeholder="e.g. add to cart"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isNew} onChange={e => set('isNew', e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">Mark as New</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.onSale} onChange={e => set('onSale', e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">On Sale</span>
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Images</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Images (URLs)</label>
              {thumbImages.map((url, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={url} onChange={e => { const a = [...thumbImages]; a[i] = e.target.value; setThumbImages(a) }}
                    placeholder="https://..." className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  <button type="button" onClick={() => setThumbImages(t => t.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-2">×</button>
                </div>
              ))}
              <button type="button" onClick={() => setThumbImages([...thumbImages, ''])} className="text-sm text-blue-600 hover:underline">+ Add thumbnail</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (URLs)</label>
              {galleryImages.map((url, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={url} onChange={e => { const a = [...galleryImages]; a[i] = e.target.value; setGalleryImages(a) }}
                    placeholder="https://..." className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  <button type="button" onClick={() => setGalleryImages(g => g.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-2">×</button>
                </div>
              ))}
              <button type="button" onClick={() => setGalleryImages([...galleryImages, ''])} className="text-sm text-blue-600 hover:underline">+ Add gallery image</button>
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Sizes</h2>
            <div className="flex gap-2">
              <input value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                placeholder="e.g. XS, S, M, L, XL" className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              <button type="button" onClick={addSize} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map(s => (
                <span key={s} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {s}
                  <button type="button" onClick={() => setSizes(sizes.filter(x => x !== s))} className="text-gray-400 hover:text-gray-600 ml-1">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Variations (Colors) */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Color Variations</h2>
            {variations.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 rounded-full border" style={{ backgroundColor: v.colorCode }} />
                <span className="text-sm font-medium flex-1">{v.color}</span>
                <button type="button" onClick={() => setVariations(variations.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 p-3 border border-dashed rounded-lg">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Color Name</label>
                <input value={newVariation.color} onChange={e => setNewVariation(v => ({ ...v, color: e.target.value }))}
                  placeholder="e.g. Red" className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Color Code</label>
                <div className="flex gap-2">
                  <input type="color" value={newVariation.colorCode} onChange={e => setNewVariation(v => ({ ...v, colorCode: e.target.value }))}
                    className="w-10 h-9 border rounded cursor-pointer" />
                  <input value={newVariation.colorCode} onChange={e => setNewVariation(v => ({ ...v, colorCode: e.target.value }))}
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Color Image URL</label>
                <input value={newVariation.colorImage} onChange={e => setNewVariation(v => ({ ...v, colorImage: e.target.value }))}
                  placeholder="https://..." className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Product Image for this color</label>
                <input value={newVariation.image} onChange={e => setNewVariation(v => ({ ...v, image: e.target.value }))}
                  placeholder="https://..." className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="col-span-2">
                <button type="button" onClick={addVariation}
                  className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition">
                  + Add Color Variation
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <button type="button" onClick={() => router.back()} className="border px-8 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  )
}
