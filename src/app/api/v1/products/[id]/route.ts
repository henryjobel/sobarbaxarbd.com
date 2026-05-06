import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, notFound } from '@/lib/response'
import { parseProductJson } from '../route'

// GET /api/v1/products/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, reviews: { include: { user: { select: { name: true, avatar: true } } } } },
  })
  if (!product) return notFound('Product')
  return ok(parseProductJson(product as Record<string, unknown>))
}

// PATCH /api/v1/products/[id]  (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    const body = await req.json()
    const updateData: Record<string, unknown> = {}
    const fields = ['name', 'slug', 'description', 'type', 'gender', 'brand', 'action', 'status', 'categoryId']
    for (const f of fields) if (body[f] !== undefined) updateData[f] = body[f]
    if (body.price !== undefined) updateData.price = Number(body.price)
    if (body.originPrice !== undefined) updateData.originPrice = Number(body.originPrice)
    if (body.quantity !== undefined) updateData.quantity = Number(body.quantity)
    if (body.isNew !== undefined) updateData.isNew = body.isNew
    if (body.onSale !== undefined) updateData.onSale = body.onSale
    if (body.thumbImage !== undefined) updateData.thumbImage = JSON.stringify(body.thumbImage)
    if (body.images !== undefined) updateData.images = JSON.stringify(body.images)
    if (body.variations !== undefined) updateData.variations = JSON.stringify(body.variations)
    if (body.sizes !== undefined) updateData.sizes = JSON.stringify(body.sizes)

    const product = await prisma.product.update({ where: { id }, data: updateData })
    return ok(parseProductJson(product as Record<string, unknown>))
  } catch {
    return error('Failed to update product', 500)
  }
}

// DELETE /api/v1/products/[id]  (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    await prisma.product.update({ where: { id }, data: { status: 'archived' } })
    return ok({ message: 'Product archived' })
  } catch {
    return error('Failed to delete product', 500)
  }
}
