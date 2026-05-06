import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, notFound } from '@/lib/response'

// PATCH /api/v1/cart/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const { id } = await params
  const { quantity } = await req.json()

  const item = await prisma.cartItem.findFirst({ where: { id, userId: user.userId } })
  if (!item) return notFound('Cart item')

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
    include: { product: true },
  })
  return ok(updated)
}

// DELETE /api/v1/cart/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const { id } = await params
  const item = await prisma.cartItem.findFirst({ where: { id, userId: user.userId } })
  if (!item) return notFound('Cart item')

  await prisma.cartItem.delete({ where: { id } })
  return ok({ message: 'Removed from cart' })
}
