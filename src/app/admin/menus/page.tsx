'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'

interface MenuItem {
  id: string; label: string; url: string; target: string; order: number
  children: MenuItem[]
}
interface Menu { id: string; name: string; location: string; items: MenuItem[] }

const LOCATIONS = [
  { value: 'primary', label: 'Primary Navigation (Header)' },
  { value: 'footer', label: 'Footer Menu' },
  { value: 'mobile', label: 'Mobile Menu' },
]

const QUICK_LINKS = [
  { label: 'Home', url: '/' },
  { label: 'Shop', url: '/shop' },
  { label: 'Blog', url: '/blog' },
  { label: 'About', url: '/p/about' },
  { label: 'Contact', url: '/p/contact' },
  { label: 'FAQ', url: '/p/faq' },
]

export default function AdminMenusPage() {
  const { token } = useAdminAuth()
  const [menus, setMenus] = useState<Menu[]>([])
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newItem, setNewItem] = useState({ label: '', url: '', target: '_self' })
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editForm, setEditForm] = useState({ label: '', url: '', target: '_self' })
  const [createMenuForm, setCreateMenuForm] = useState({ name: '', location: 'primary' })
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const fetchMenus = useCallback(() => {
    fetch('/api/v1/menus')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setMenus(res.data)
          if (res.data.length && !activeMenu) setActiveMenu(res.data[0])
        }
      })
      .finally(() => setLoading(false))
  }, [activeMenu])

  useEffect(() => { fetchMenus() }, [token])

  const refreshActiveMenu = async (menuId: string) => {
    const res = await fetch(`/api/v1/menus/${menuId}`)
    const data = await res.json()
    if (data.success) {
      setActiveMenu(data.data)
      setMenus(prev => prev.map(m => m.id === menuId ? data.data : m))
    }
  }

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/v1/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(createMenuForm),
    })
    const data = await res.json()
    if (data.success) {
      setMenus(prev => {
        const exists = prev.find(m => m.id === data.data.id)
        return exists ? prev.map(m => m.id === data.data.id ? data.data : m) : [...prev, data.data]
      })
      setActiveMenu(data.data)
      setShowCreateMenu(false)
      setCreateMenuForm({ name: '', location: 'primary' })
      setStatusMsg('Menu created!')
    }
    setSaving(false)
    setTimeout(() => setStatusMsg(''), 2500)
  }

  const addItem = async (label: string, url: string, target = '_self') => {
    if (!activeMenu || !label || !url) return
    const res = await fetch(`/api/v1/menus/${activeMenu.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ label, url, target }),
    })
    if ((await res.json()).success) {
      await refreshActiveMenu(activeMenu.id)
      setNewItem({ label: '', url: '', target: '_self' })
      setStatusMsg('Item added!')
      setTimeout(() => setStatusMsg(''), 2000)
    }
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    addItem(newItem.label, newItem.url, newItem.target)
  }

  const openEdit = (item: MenuItem) => {
    setEditingItem(item)
    setEditForm({ label: item.label, url: item.url, target: item.target })
  }

  const saveEdit = async () => {
    if (!editingItem) return
    const res = await fetch(`/api/v1/menu-items/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(editForm),
    })
    if ((await res.json()).success) {
      await refreshActiveMenu(activeMenu!.id)
      setEditingItem(null)
      setStatusMsg('Saved!')
      setTimeout(() => setStatusMsg(''), 2000)
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm('Remove this menu item?')) return
    const res = await fetch(`/api/v1/menu-items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if ((await res.json()).success) await refreshActiveMenu(activeMenu!.id)
  }

  const moveItem = async (item: MenuItem, dir: -1 | 1) => {
    await fetch(`/api/v1/menu-items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ order: item.order + dir }),
    })
    await refreshActiveMenu(activeMenu!.id)
  }

  const deleteMenu = async (menuId: string) => {
    if (!confirm('Delete this entire menu?')) return
    const res = await fetch(`/api/v1/menus/${menuId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if ((await res.json()).success) {
      const remaining = menus.filter(m => m.id !== menuId)
      setMenus(remaining)
      setActiveMenu(remaining[0] ?? null)
    }
  }

  const allItems = activeMenu?.items ?? []

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menus</h1>
            <p className="text-gray-500 text-sm">Build navigation menus for your site</p>
          </div>
          <div className="flex gap-2 items-center">
            {statusMsg && <span className="text-sm text-green-600 font-medium">{statusMsg}</span>}
            <button onClick={() => setShowCreateMenu(true)}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
              + Create Menu
            </button>
          </div>
        </div>

        {/* Create menu modal */}
        {showCreateMenu && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
              <h2 className="font-semibold text-lg mb-4">Create New Menu</h2>
              <form onSubmit={handleCreateMenu} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Menu Name *</label>
                  <input required value={createMenuForm.name} onChange={e => setCreateMenuForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Main Navigation" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <select value={createMenuForm.location} onChange={e => setCreateMenuForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                    {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowCreateMenu(false)}
                    className="flex-1 border py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-gray-400">Loading menus...</div>
        ) : menus.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400 mb-4">No menus yet. Create your first navigation menu.</p>
            <button onClick={() => setShowCreateMenu(true)}
              className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium">
              + Create Menu
            </button>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Menu Selector */}
            <div className="w-56 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-3 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">Your Menus</p>
                {menus.map(m => (
                  <button key={m.id} onClick={() => setActiveMenu(m)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${activeMenu?.id === m.id ? 'bg-black text-white font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <span className="block">{m.name}</span>
                    <span className={`text-xs ${activeMenu?.id === m.id ? 'text-gray-300' : 'text-gray-400'}`}>
                      {LOCATIONS.find(l => l.value === m.location)?.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Editor */}
            {activeMenu && (
              <div className="flex-1 min-w-0 flex gap-5">
                {/* Add Items Panel */}
                <div className="w-64 flex-shrink-0 space-y-4">
                  {/* Quick Links */}
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Add</h3>
                    <div className="space-y-1.5">
                      {QUICK_LINKS.map(link => (
                        <div key={link.url} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{link.label}</span>
                          <button onClick={() => addItem(link.label, link.url)}
                            className="text-xs text-blue-600 hover:underline font-medium">Add</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Link */}
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Custom Link</h3>
                    <form onSubmit={handleAddItem} className="space-y-2">
                      <input value={newItem.url} onChange={e => setNewItem(f => ({ ...f, url: e.target.value }))}
                        placeholder="URL (e.g. /shop or https://...)"
                        className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black" />
                      <input value={newItem.label} onChange={e => setNewItem(f => ({ ...f, label: e.target.value }))}
                        placeholder="Link Text"
                        className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black" />
                      <select value={newItem.target} onChange={e => setNewItem(f => ({ ...f, target: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black">
                        <option value="_self">Same tab</option>
                        <option value="_blank">New tab</option>
                      </select>
                      <button type="submit"
                        className="w-full bg-gray-900 text-white py-2 rounded-lg text-xs font-medium hover:bg-black transition">
                        Add to Menu
                      </button>
                    </form>
                  </div>
                </div>

                {/* Menu Structure */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <div>
                        <h2 className="font-semibold text-gray-900">{activeMenu.name}</h2>
                        <p className="text-xs text-gray-400">
                          {LOCATIONS.find(l => l.value === activeMenu.location)?.label} — {allItems.length} items
                        </p>
                      </div>
                      <button onClick={() => deleteMenu(activeMenu.id)}
                        className="text-xs text-red-400 hover:text-red-600 hover:underline">
                        Delete Menu
                      </button>
                    </div>

                    {allItems.length === 0 ? (
                      <p className="text-gray-400 text-sm py-8 text-center">No items yet. Add links from the left panel.</p>
                    ) : (
                      <div className="space-y-2">
                        {allItems.map((item, idx) => (
                          <div key={item.id}>
                            {/* Parent item */}
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 group">
                              <div className="flex flex-col gap-0.5">
                                <button onClick={() => moveItem(item, -1)} disabled={idx === 0}
                                  className="text-gray-300 hover:text-gray-600 text-xs disabled:opacity-20">▲</button>
                                <button onClick={() => moveItem(item, 1)} disabled={idx === allItems.length - 1}
                                  className="text-gray-300 hover:text-gray-600 text-xs disabled:opacity-20">▼</button>
                              </div>
                              <div className="flex-1 min-w-0">
                                {editingItem?.id === item.id ? (
                                  <div className="flex gap-2 items-center">
                                    <input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                                      className="border rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-black" />
                                    <input value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))}
                                      className="border rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-black" />
                                    <select value={editForm.target} onChange={e => setEditForm(f => ({ ...f, target: e.target.value }))}
                                      className="border rounded px-2 py-1 text-xs focus:outline-none">
                                      <option value="_self">Same tab</option>
                                      <option value="_blank">New tab</option>
                                    </select>
                                    <button onClick={saveEdit} className="text-xs text-green-600 font-medium">Save</button>
                                    <button onClick={() => setEditingItem(null)} className="text-xs text-gray-400">Cancel</button>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                    <p className="text-xs text-gray-400">{item.url}{item.target === '_blank' ? ' ↗' : ''}</p>
                                  </div>
                                )}
                              </div>
                              {editingItem?.id !== item.id && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                  <button onClick={() => deleteItem(item.id)} className="text-xs text-red-500 hover:underline">×</button>
                                </div>
                              )}
                            </div>

                            {/* Sub items (children) */}
                            {item.children.map(child => (
                              <div key={child.id} className="flex items-center gap-2 p-3 ml-8 mt-1 bg-white rounded-lg border border-gray-200 border-l-4 border-l-gray-300 group">
                                <div className="flex-1 min-w-0">
                                  {editingItem?.id === child.id ? (
                                    <div className="flex gap-2 items-center">
                                      <input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                                        className="border rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-black" />
                                      <input value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))}
                                        className="border rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-black" />
                                      <button onClick={saveEdit} className="text-xs text-green-600 font-medium">Save</button>
                                      <button onClick={() => setEditingItem(null)} className="text-xs text-gray-400">Cancel</button>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm text-gray-700">{child.label}</p>
                                      <p className="text-xs text-gray-400">{child.url}</p>
                                    </div>
                                  )}
                                </div>
                                {editingItem?.id !== child.id && (
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => openEdit(child)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => deleteItem(child.id)} className="text-xs text-red-500 hover:underline">×</button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
