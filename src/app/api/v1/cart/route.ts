import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, created, unauthorized } from '@/lib/response'

// GET /api/v1/cart
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const items = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  })
  return ok(items)
}

// POST /api/v1/cart
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  try {
    const { productId, quantity = 1, size, color, selectedVariation } = await req.json()
    if (!productId) return error('productId is required')

    // If same product+size+color exists, increase quantity
    const existing = await prisma.cartItem.findFirst({
      where: { userId: user.userId, productId, size: size || null, color: color || null },
    })

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      })
      return ok(updated)
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: user.userId,
        productId,
        quantity,
        size,
        color,
        selectedVariation: selectedVariation ? JSON.stringify(selectedVariation) : null,
      },
      include: { product: true },
    })
    return created(item)
  } catch {
    return error('Failed to add to cart', 500)
  }
}

// DELETE /api/v1/cart/clear
export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  await prisma.cartItem.deleteMany({ where: { userId: user.userId } })
  return ok({ message: 'Cart cleared' })
}
