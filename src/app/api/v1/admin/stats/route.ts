import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, unauthorized, forbidden } from '@/lib/response'

// GET /api/v1/admin/stats
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    revenueResult,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { status: 'active' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, items: true },
    }),
  ])

  return ok({
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    revenue: revenueResult._sum.total || 0,
    recentOrders,
  })
}
