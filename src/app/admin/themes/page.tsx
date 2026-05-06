'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'
import Image from 'next/image'

const THEMES = [
  { id: 'custom',       label: 'Custom CMS',    preview: '',                               niche: 'CMS' },
  { id: 'fashion1',     label: 'Fashion 1',     preview: '/images/slider/fashion1.png',    niche: 'Fashion' },
  { id: 'fashion2',     label: 'Fashion 2',     preview: '/images/slider/fashion2.png',    niche: 'Fashion' },
  { id: 'fashion3',     label: 'Fashion 3',     preview: '/images/slider/fashion3.png',    niche: 'Fashion' },
  { id: 'fashion4',     label: 'Fashion 4',     preview: '/images/slider/fashion4.png',    niche: 'Fashion' },
  { id: 'fashion5',     label: 'Fashion 5',     preview: '/images/slider/fashion5.png',    niche: 'Fashion' },
  { id: 'fashion6',     label: 'Fashion 6',     preview: '/images/slider/fashion6.png',    niche: 'Fashion' },
  { id: 'fashion7',     label: 'Fashion 7',     preview: '/images/slider/fashion7.png',    niche: 'Fashion' },
  { id: 'fashion8',     label: 'Fashion 8',     preview: '/images/slider/fashion8.png',    niche: 'Fashion' },
  { id: 'fashion9',     label: 'Fashion 9',     preview: '/images/slider/fashion9.png',    niche: 'Fashion' },
  { id: 'fashion10',    label: 'Fashion 10',    preview: '/images/slider/fashion10.png',   niche: 'Fashion' },
  { id: 'fashion11',    label: 'Fashion 11',    preview: '/images/slider/fashion11.png',   niche: 'Fashion' },
  { id: 'cosmetic1',    label: 'Cosmetic 1',    preview: '/images/slider/cosmetic1.png',   niche: 'Cosmetic' },
  { id: 'cosmetic2',    label: 'Cosmetic 2',    preview: '/images/slider/cosmetic2.png',   niche: 'Cosmetic' },
  { id: 'cosmetic3',    label: 'Cosmetic 3',    preview: '/images/slider/cosmetic3.png',   niche: 'Cosmetic' },
  { id: 'furniture',    label: 'Furniture',     preview: '/images/slider/furniture.png',   niche: 'Furniture' },
  { id: 'jewelry',      label: 'Jewelry',       preview: '/images/slider/jewelry.png',     niche: 'Jewelry' },
  { id: 'marketplace',  label: 'Marketplace',   preview: '/images/slider/marketplace.png', niche: 'Marketplace' },
  { id: 'organic',      label: 'Organic',       preview: '/images/slider/organic.png',     niche: 'Organic' },
  { id: 'pet',          label: 'Pet',           preview: '/images/slider/pet.png',         niche: 'Pet' },
  { id: 'toys',         label: 'Toys & Kids',   preview: '/images/slider/toys.png',        niche: 'Toys' },
  { id: 'underwear',    label: 'Underwear',     preview: '/images/slider/underwear.png',   niche: 'Underwear' },
  { id: 'watch',        label: 'Watch',         preview: '/images/slider/watch.png',       niche: 'Watch' },
  { id: 'yoga',         label: 'Yoga',          preview: '/images/slider/yoga.png',        niche: 'Yoga' },
]

const NICHES = ['All', ...Array.from(new Set(THEMES.map(t => t.niche)))]

export default function ThemesPage() {
  const { token } = useAdminAuth()
  const [activeTheme, setActiveTheme] = useState('fashion1')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('All')
  const [saved, setSaved] = useState(false)

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/v1/settings')
    const data = await res.json()
    if (data.success) setActiveTheme(data.data.active_theme || 'fashion1')
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const applyTheme = async (themeId: string) => {
    if (!token) return
    setSaving(true)
    const res = await fetch('/api/v1/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active_theme: themeId }),
    })
    const data = await res.json()
    if (data.success) {
      setActiveTheme(themeId)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const filtered = filter === 'All' ? THEMES : THEMES.filter(t => t.niche === filter)

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Theme Selector</h1>
            <p className="text-gray-500 text-sm mt-1">Click any theme to apply it to your store instantly</p>
          </div>
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
              ✓ Theme applied successfully!
            </div>
          )}
        </div>

        {/* Active theme banner */}
        <div className="bg-black text-white rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Currently Active</p>
            <p className="text-lg font-semibold">{THEMES.find(t => t.id === activeTheme)?.label || activeTheme}</p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Preview Live Site →
          </a>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {NICHES.map(niche => (
            <button
              key={niche}
              onClick={() => setFilter(niche)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === niche ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        {/* Theme grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(theme => {
            const isActive = theme.id === activeTheme
            return (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme.id)}
                disabled={saving}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all text-left ${
                  isActive
                    ? 'border-black shadow-lg scale-[1.02]'
                    : 'border-transparent hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Preview image */}
                <div className="aspect-[4/3] bg-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">
                    🖼
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-medium">
                        ✓ Active
                      </span>
                    </div>
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white text-black text-xs px-3 py-1.5 rounded-full font-medium shadow">
                        Apply Theme
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white">
                  <p className="text-sm font-semibold text-gray-900">{theme.label}</p>
                  <p className="text-xs text-gray-400">{theme.niche}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </AdminGuard>
  )
}
