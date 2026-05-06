import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, created, unauthorized, forbidden } from '@/lib/response'

// GET /api/v1/reviews  (admin only — all reviews)
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 20)

  const [total, reviews] = await Promise.all([
    prisma.review.count(),
    prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return ok({ reviews, pagination: { total, page, limit, pages: Math.ceil(total / limit) } })
}

// POST /api/v1/reviews
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  try {
    const { productId, rating, comment } = await req.json()
    if (!productId || !rating) return error('productId and rating are required')
    if (rating < 1 || rating > 5) return error('Rating must be between 1 and 5')

    const review = await prisma.review.create({
      data: { userId: user.userId, productId, rating: Number(rating), comment },
      include: { user: { select: { name: true, avatar: true } } },
    })

    // Update product avg rating
    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    })
    await prisma.product.update({
      where: { id: productId },
      data: { rate: agg._avg.rating || 0 },
    })

    return created(review)
  } catch {
    return error('You have already reviewed this product', 409)
  }
}
