'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'

interface Order {
  id: string
  total: number
  subtotal: number
  discount: number
  shipping: number
  status: string
  paymentStatus: string
  paymentMethod: string
  couponCode: string | null
  createdAt: string
  user: { name: string; email: string }
  items: Array<{ name: string; quantity: number; price: number }>
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_OPTIONS = ['unpaid', 'paid']

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const { token } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`/api/v1/orders?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setOrders(res.data.orders)
          setTotal(res.data.pagination.total)
        }
      })
      .finally(() => setLoading(false))
  }, [token, page])

  const updateOrder = async (id: string, field: string, value: string) => {
    const res = await fetch(`/api/v1/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ [field]: value }),
    })
    const data = await res.json()
    if (data.success) {
      setOrders(orders.map(o => o.id === id ? { ...o, [field]: value } : o))
    }
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{total} orders total</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Order ID</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Payment</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : orders.map(order => (
                    <>
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-mono text-xs text-gray-500">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{order.user.name || 'Guest'}</p>
                          <p className="text-xs text-gray-400">{order.user.email}</p>
                        </td>
                        <td className="px-5 py-4 font-medium">৳{order.total.toFixed(0)}</td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={e => updateOrder(order.id, 'status', e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColors[order.status] || ''}`}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.paymentStatus}
                            onChange={e => updateOrder(order.id, 'paymentStatus', e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            {expanded === order.id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      {expanded === order.id && (
                        <tr key={`${order.id}-details`}>
                          <td colSpan={7} className="px-5 pb-4 bg-gray-50">
                            <div className="space-y-1">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span>{item.name} × {item.quantity}</span>
                                  <span className="font-medium">৳{(item.price * item.quantity).toFixed(0)}</span>
                                </div>
                              ))}
                              <div className="border-t pt-2 mt-2 text-xs text-gray-500 space-y-0.5">
                                <div className="flex justify-between"><span>Subtotal</span><span>৳{order.subtotal.toFixed(0)}</span></div>
                                {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({order.couponCode})</span><span>-৳{order.discount.toFixed(0)}</span></div>}
                                <div className="flex justify-between"><span>Shipping</span><span>৳{order.shipping.toFixed(0)}</span></div>
                                <div className="flex justify-between font-bold text-gray-900 text-sm"><span>Total</span><span>৳{order.total.toFixed(0)}</span></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>

          {total > 20 && (
            <div className="px-5 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">Page {page}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
                <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}
