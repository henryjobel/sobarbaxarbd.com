import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden } from '@/lib/response'

// GET /api/v1/admin/users
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 20)
  const search = searchParams.get('search') || ''

  const where = search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return ok({ users, pagination: { total, page, limit, pages: Math.ceil(total / limit) } })
}
