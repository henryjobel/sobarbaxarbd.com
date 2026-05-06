'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'
import Link from 'next/link'

interface Page {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: string
  template: string
  createdAt: string
  updatedAt: string
}

export default function AdminPagesPage() {
  const { token } = useAdminAuth()
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchPages = () => {
    if (!token) return
    fetch('/api/v1/pages?_admin=1', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => { if (res.success) setPages(res.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPages() }, [token])

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete page "${title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/v1/pages/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if ((await res.json()).success) setPages(prev => prev.filter(p => p.slug !== slug))
  }

  const handleToggleStatus = async (page: Page) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/v1/pages/${page.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    })
    if ((await res.json()).success) setPages(prev => prev.map(p => p.slug === page.slug ? { ...p, status: newStatus } : p))
  }

  const filtered = pages
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))

  const published = pages.filter(p => p.status === 'published').length
  const draft = pages.filter(p => p.status === 'draft').length

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
            <p className="text-gray-500 text-sm">{pages.length} pages — {published} published, {draft} drafts</p>
          </div>
          <Link href="/admin/pages/new"
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            + Add New Page
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex gap-4 mb-4 items-center">
          <div className="flex gap-1 text-sm">
            {[{ key: 'all', label: `All (${pages.length})` }, { key: 'published', label: `Published (${published})` }, { key: 'draft', label: `Drafts (${draft})` }].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === f.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="ml-auto border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-60" />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Title</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Slug / URL</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Template</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Updated</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(3)].map((_, i) => (
                    <tr key={i}>{[...Array(6)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                : filtered.length === 0
                  ? <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No pages found. <Link href="/admin/pages/new" className="text-blue-600 hover:underline">Create your first page.</Link></td></tr>
                  : filtered.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {p.title}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 text-xs font-mono">/p/{p.slug}</span>
                            <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
                              className="text-gray-300 hover:text-gray-600 transition" title="View page">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500 capitalize">{p.template}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleToggleStatus(p)}
                            className={`text-xs px-3 py-1 rounded-full font-medium transition ${p.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                            {p.status === 'published' ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-3">
                            <button onClick={() => router.push(`/admin/pages/${p.id}`)}
                              className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                            <button onClick={() => handleDelete(p.slug, p.title)}
                              className="text-red-500 hover:underline text-xs font-medium">Delete</button>
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
