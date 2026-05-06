'use client'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  sold: number
  status: string
  isNew: boolean
  onSale: boolean
  category?: { name: string }
  createdAt: string
}

export default function AdminProductsPage() {
  const { token } = useAdminAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    fetch(`/api/v1/products?${params}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setProducts(res.data.products)
          setTotal(res.data.pagination.total)
        }
      })
      .finally(() => setLoading(false))
  }, [token, page, search])

  const handleDelete = async (id: string) => {
    if (!confirm('Archive this product?')) return
    await fetch(`/api/v1/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setProducts(p => p.filter(pr => pr.id !== id))
  }

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm">{total} products total</p>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            + Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Price</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Stock</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Sold</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <div className="flex gap-1 mt-0.5">
                            {product.isNew && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 rounded">New</span>}
                            {product.onSale && <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded">Sale</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{product.category?.name || '—'}</td>
                      <td className="px-5 py-4 font-medium">৳{product.price}</td>
                      <td className="px-5 py-4">
                        <span className={product.quantity < 5 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{product.sold}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:underline text-xs">Edit</Link>
                          <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline text-xs">Archive</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                    No products found.{' '}
                    <Link href="/admin/products/new" className="text-blue-600 hover:underline">Add one?</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {total > 20 && (
            <div className="px-5 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
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
