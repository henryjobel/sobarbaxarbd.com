'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { name: string | null; email: string }
  product: { name: string }
}

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function AdminReviewsPage() {
  const { token } = useAdminAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`/api/v1/reviews?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) { setReviews(res.data.reviews); setTotal(res.data.pagination.total) }
      })
      .finally(() => setLoading(false))
  }, [token, page])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return
    const res = await fetch(`/api/v1/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if ((await res.json()).success) {
      setReviews(r => r.filter(rv => rv.id !== id))
      setTotal(t => t - 1)
    }
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 text-sm">{total} reviews total</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Rating</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Comment</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>{[...Array(6)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                : reviews.map(review => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{review.user.name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-400">{review.user.email}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-700 max-w-[180px] truncate">{review.product.name}</td>
                      <td className="px-5 py-4">
                        <span className="text-yellow-400 text-base">{stars(review.rating)}</span>
                        <span className="text-xs text-gray-500 ml-1">({review.rating}/5)</span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 max-w-[200px]">
                        <p className="truncate">{review.comment || <span className="text-gray-400 italic">No comment</span>}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:underline text-xs font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(total / 20)}</span>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
