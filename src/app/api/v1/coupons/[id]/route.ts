import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, notFound } from '@/lib/response'

// PATCH /api/v1/coupons/[id]  (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    const body = await req.json()
    const updateData: Record<string, unknown> = {}
    if (body.code !== undefined) updateData.code = body.code.toUpperCase()
    if (body.type !== undefined) updateData.type = body.type
    if (body.value !== undefined) updateData.value = Number(body.value)
    if (body.minOrder !== undefined) updateData.minOrder = Number(body.minOrder)
    if (body.maxUses !== undefined) updateData.maxUses = body.maxUses ? Number(body.maxUses) : null
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const coupon = await prisma.coupon.update({ where: { id }, data: updateData })
    return ok(coupon)
  } catch {
    return error('Failed to update coupon', 500)
  }
}

// DELETE /api/v1/coupons/[id]  (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    await prisma.coupon.delete({ where: { id } })
    return ok({ message: 'Coupon deleted' })
  } catch {
    return notFound('Coupon')
  }
}
