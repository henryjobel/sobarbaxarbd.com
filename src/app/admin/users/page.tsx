'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  phone: string | null
  createdAt: string
  _count: { orders: number }
}

export default function AdminUsersPage() {
  const { token } = useAdminAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    fetch(`/api/v1/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) { setUsers(res.data.users); setTotal(res.data.pagination.total) }
      })
      .finally(() => setLoading(false))
  }, [token, search])

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">{total} registered users</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-4">
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Role</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Orders</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>{[...Array(6)].map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}</tr>
                  ))
                : users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium">{user.name || '—'}</td>
                      <td className="px-5 py-4 text-gray-500">{user.email}</td>
                      <td className="px-5 py-4 text-gray-500">{user.phone || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{user._count.orders}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  )
}
