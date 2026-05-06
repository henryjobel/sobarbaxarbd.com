'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from './AdminAuthContext'
import AdminGuard from './components/AdminGuard'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  revenue: number
  recentOrders: Array<{
    id: string; total: number; status: string; createdAt: string
    user: { name: string; email: string }
    items: Array<{ name: string; quantity: number }>
  }>
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const CMS_SHORTCUTS = [
  { href: '/admin/pages/new',    icon: '📄', label: 'New Page',      color: 'hover:border-blue-300 hover:bg-blue-50' },
  { href: '/admin/blogs',        icon: '✍️', label: 'New Post',      color: 'hover:border-green-300 hover:bg-green-50' },
  { href: '/admin/menus',        icon: '🧭', label: 'Edit Menus',    color: 'hover:border-purple-300 hover:bg-purple-50' },
  { href: '/admin/sliders',      icon: '🖼', label: 'Sliders',       color: 'hover:border-orange-300 hover:bg-orange-50' },
  { href: '/admin/banners',      icon: '📢', label: 'Banners',       color: 'hover:border-pink-300 hover:bg-pink-50' },
  { href: '/admin/sections',     icon: '🧩', label: 'Sections',      color: 'hover:border-teal-300 hover:bg-teal-50' },
  { href: '/admin/themes',       icon: '🎨', label: 'Themes',        color: 'hover:border-violet-300 hover:bg-violet-50' },
  { href: '/admin/products/new', icon: '📦', label: 'Add Product',   color: 'hover:border-yellow-300 hover:bg-yellow-50' },
]

function StatCard({ icon, label, value, sub, href, color }: {
  icon: string; label: string; value: string | number; sub?: string; href: string; color: string
}) {
  return (
    <Link href={href}
      className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${color} hover:shadow-md transition group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl opacity-60 group-hover:opacity-100 transition">{icon}</span>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const { token, user } = useAdminAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/v1/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => { if (res.success) setStats(res.data) })
      .finally(() => setLoading(false))
  }, [token])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AdminGuard>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name || 'Admin'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse h-28" />)}
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard icon="💰" label="Total Revenue" value={`৳${stats.revenue.toFixed(0)}`}
                sub="From paid orders" href="/admin/orders" color="border-emerald-500" />
              <StatCard icon="🛒" label="Total Orders" value={stats.totalOrders}
                sub={`${stats.pendingOrders} pending`} href="/admin/orders" color="border-blue-500" />
              <StatCard icon="📦" label="Products" value={stats.totalProducts}
                href="/admin/products" color="border-purple-500" />
              <StatCard icon="👥" label="Customers" value={stats.totalUsers}
                href="/admin/users" color="border-orange-500" />
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Recent Orders */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline font-medium">View all →</Link>
                </div>
                {stats.recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-300 text-4xl mb-2">🛒</p>
                    <p className="text-gray-400 text-sm">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{order.user.name || order.user.email}</p>
                          <p className="text-xs text-gray-400 truncate">{order.items.map(i => i.name).join(', ')}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                          <span className="text-sm font-bold text-gray-900">৳{order.total.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right panel */}
              <div className="space-y-5">
                {/* Pending alert */}
                {stats.pendingOrders > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-600">⚠️</span>
                      <span className="text-sm font-semibold text-yellow-800">Action Required</span>
                    </div>
                    <p className="text-xs text-yellow-700">{stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} waiting for processing.</p>
                    <Link href="/admin/orders?status=pending"
                      className="text-xs text-yellow-700 font-semibold hover:underline mt-1 block">
                      View pending orders →
                    </Link>
                  </div>
                )}

                {/* Revenue card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl p-5 text-white">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Revenue This Month</p>
                  <p className="text-3xl font-bold mt-1">৳{stats.revenue.toFixed(0)}</p>
                  <p className="text-xs text-gray-400 mt-2">From {stats.totalOrders} total orders</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* CMS Shortcuts — WordPress-style */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CMS_SHORTCUTS.map(s => (
              <Link key={s.href} href={s.href}
                className={`flex flex-col items-center gap-2 p-4 border-2 border-transparent rounded-xl transition cursor-pointer ${s.color}`}>
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-medium text-gray-700">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Site Overview */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/pages" className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <span className="text-xl">📄</span>
              <div>
                <p className="text-xs text-gray-500">Custom Pages</p>
                <p className="text-sm font-semibold text-gray-900">Manage all pages</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/menus" className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <span className="text-xl">🧭</span>
              <div>
                <p className="text-xs text-gray-500">Navigation</p>
                <p className="text-sm font-semibold text-gray-900">Build nav menus</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/settings" className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚙️</span>
              <div>
                <p className="text-xs text-gray-500">Settings</p>
                <p className="text-sm font-semibold text-gray-900">Site configuration</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AdminGuard>
  )
}
