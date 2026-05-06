import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, created, unauthorized, notFound } from '@/lib/response'

// POST /api/v1/wishlist/[productId]
export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const { productId } = await params
  try {
    const item = await prisma.wishlistItem.create({
      data: { userId: user.userId, productId },
      include: { product: true },
    })
    return created(item)
  } catch {
    return error('Already in wishlist', 409)
  }
}

// DELETE /api/v1/wishlist/[productId]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const { productId } = await params
  const item = await prisma.wishlistItem.findFirst({
    where: { userId: user.userId, productId },
  })
  if (!item) return notFound('Wishlist item')

  await prisma.wishlistItem.delete({ where: { id: item.id } })
  return ok({ message: 'Removed from wishlist' })
}
