'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'
import Link from 'next/link'

interface Blog {
  id: string
  title: string
  slug: string
  category: string | null
  author: string | null
  published: boolean
  createdAt: string
}

export default function AdminBlogsPage() {
  const { token } = useAdminAuth()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetchBlogs = (p = 1) => {
    if (!token) return
    setLoading(true)
    fetch(`/api/v1/blogs?page=${p}&limit=20&_admin=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setBlogs(res.data.data)
          setTotal(res.data.meta.total)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBlogs(page) }, [token, page])

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this blog post?')) return
    await fetch(`/api/v1/blogs/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setBlogs(b => b.filter(bl => bl.slug !== slug))
    setTotal(t => t - 1)
  }

  const handleTogglePublish = async (blog: Blog) => {
    const res = await fetch(`/api/v1/blogs/${blog.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: !blog.published }),
    })
    const data = await res.json()
    if (data.success) {
      setBlogs(b => b.map(bl => bl.slug === blog.slug ? { ...bl, published: !bl.published } : bl))
    }
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-gray-500 text-sm">{total} posts total</p>
          </div>
          <Link href="/admin/blogs/new" className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            + New Post
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Title</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Author</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : blogs.map(blog => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 max-w-[260px] truncate">{blog.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{blog.slug}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{blog.category || '—'}</td>
                      <td className="px-5 py-4 text-gray-600">{blog.author || '—'}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleTogglePublish(blog)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition ${blog.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {blog.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/blogs/edit?slug=${blog.slug}`} className="text-blue-600 hover:underline text-xs font-medium">Edit</Link>
                          <button onClick={() => handleDelete(blog.slug)} className="text-red-500 hover:underline text-xs font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page}</span>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
