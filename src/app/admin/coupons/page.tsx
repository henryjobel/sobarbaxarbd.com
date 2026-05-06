'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  minOrder: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
}

const emptyForm = { code: '', type: 'percent', value: '', minOrder: '0', maxUses: '', expiresAt: '' }

export default function AdminCouponsPage() {
  const { token } = useAdminAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Coupon | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)

  const fetchCoupons = () => {
    if (!token) return
    fetch('/api/v1/coupons', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => { if (res.success) setCoupons(res.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCoupons() }, [token])

  const openCreate = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (c: Coupon) => {
    setEditTarget(c)
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrder: String(c.minOrder),
      maxUses: c.maxUses ? String(c.maxUses) : '',
      expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
    })
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder || 0),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
    }
    const url = editTarget ? `/api/v1/coupons/${editTarget.id}` : '/api/v1/coupons'
    const method = editTarget ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      fetchCoupons()
      setShowForm(false)
      setEditTarget(null)
      setForm(emptyForm)
    } else {
      setError(data.message || 'Failed to save coupon')
    }
    setSaving(false)
  }

  const handleToggle = async (c: Coupon) => {
    const res = await fetch(`/api/v1/coupons/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !c.isActive }),
    })
    const data = await res.json()
    if (data.success) {
      setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !c.isActive } : x))
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return
    const res = await fetch(`/api/v1/coupons/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if ((await res.json()).success) {
      setCoupons(prev => prev.filter(c => c.id !== id))
    }
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
            <p className="text-gray-500 text-sm">{coupons.length} coupons</p>
          </div>
          <button onClick={openCreate}
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            + New Coupon
          </button>
        </div>

        {/* Create / Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
              <h2 className="font-semibold text-lg mb-4">{editTarget ? 'Edit Coupon' : 'Create Coupon'}</h2>
              {error && <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Code *</label>
                  <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="SAVE20" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Value *</label>
                  <input required type="number" min="0" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    placeholder={form.type === 'percent' ? '20' : '100'}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Order (৳)</label>
                  <input type="number" min="0" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Uses (blank = unlimited)</label>
                  <input type="number" min="1" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Unlimited" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expires At</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="col-span-2 flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                    {saving ? 'Saving...' : editTarget ? 'Update Coupon' : 'Create Coupon'}
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

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Code</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Discount</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Min Order</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Uses</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Expires</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(3)].map((_, i) => (
                    <tr key={i}>{[...Array(7)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                : coupons.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-mono font-bold text-gray-900">{c.code}</td>
                      <td className="px-5 py-4 font-medium text-gray-700">
                        {c.type === 'percent' ? `${c.value}% off` : `৳${c.value} off`}
                      </td>
                      <td className="px-5 py-4 text-gray-500">৳{c.minOrder}</td>
                      <td className="px-5 py-4 text-gray-500">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ' / ∞'}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleToggle(c)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition ${c.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <button onClick={() => openEdit(c)} className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                          <button onClick={() => handleDelete(c.id, c.code)} className="text-red-500 hover:underline text-xs font-medium">Delete</button>
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
