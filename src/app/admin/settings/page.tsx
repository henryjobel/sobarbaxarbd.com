'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'

export default function AdminSettingsPage() {
  const { token } = useAdminAuth()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/v1/settings')
    const data = await res.json()
    if (data.success) setSettings(data.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    const res = await fetch('/api/v1/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    })
    const data = await res.json()
    if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  const set = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }))

  return (
    <AdminGuard>
      <div className="p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          {saved && <span className="text-green-600 text-sm font-medium">✓ Saved!</span>}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-6 space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 border-b pb-3">General</h2>
            {[
              { key: 'site_name', label: 'Site Name' },
              { key: 'site_tagline', label: 'Tagline' },
              { key: 'contact_email', label: 'Contact Email' },
              { key: 'contact_phone', label: 'Contact Phone' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  value={settings[key] || ''}
                  onChange={e => set(key, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            ))}

            <h2 className="font-semibold text-gray-900 border-b pb-3 pt-2">Commerce</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input value={settings.currency || ''} onChange={e => set('currency', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="BDT" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <input value={settings.currency_symbol || ''} onChange={e => set('currency_symbol', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="৳" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Minimum (৳)</label>
                <input type="number" value={settings.free_shipping_min || ''} onChange={e => set('free_shipping_min', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="500" />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
    </AdminGuard>
  )
}
