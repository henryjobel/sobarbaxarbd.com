import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, unauthorized, notFound } from '@/lib/response'

// POST /api/v1/compare/:productId  — add to compare
export async function POST(req: NextRequest, { params }: { params: { productId: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const item = await prisma.compareItem.upsert({
    where: { userId_productId: { userId: user.userId, productId: params.productId } },
    update: {},
    create: { userId: user.userId, productId: params.productId },
    include: { product: true },
  })
  return ok(item)
}

// DELETE /api/v1/compare/:productId  — remove from compare
export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const existing = await prisma.compareItem.findUnique({
    where: { userId_productId: { userId: user.userId, productId: params.productId } },
  })
  if (!existing) return notFound()

  await prisma.compareItem.delete({
    where: { userId_productId: { userId: user.userId, productId: params.productId } },
  })
  return ok({ message: 'Removed from compare' })
}
