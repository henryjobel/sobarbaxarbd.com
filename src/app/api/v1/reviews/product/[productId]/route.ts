import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, created, unauthorized } from '@/lib/response'

// GET /api/v1/reviews/product/[productId]
export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 10)

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where: { productId } }),
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return ok({ reviews, pagination: { total, page, limit, pages: Math.ceil(total / limit) } })
}
