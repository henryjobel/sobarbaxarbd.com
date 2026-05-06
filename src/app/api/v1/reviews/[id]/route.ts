import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, notFound } from '@/lib/response'

// DELETE /api/v1/reviews/[id]  (admin or own review)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const { id } = await params
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) return notFound('Review')

  if (user.role !== 'admin' && review.userId !== user.userId) return forbidden()

  try {
    await prisma.review.delete({ where: { id } })

    // Recalculate product rating
    const agg = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
    })
    await prisma.product.update({
      where: { id: review.productId },
      data: { rate: agg._avg.rating ?? 0 },
    })

    return ok({ message: 'Review deleted' })
  } catch {
    return error('Failed to delete review', 500)
  }
}
