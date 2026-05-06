import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, notFound } from '@/lib/response'

// GET /api/v1/orders/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  })
  if (!order) return notFound('Order')
  if (user.role !== 'admin' && order.userId !== user.userId) return forbidden()
  return ok(order)
}

// PATCH /api/v1/orders/[id]  (admin only - update status)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    const { status, paymentStatus, trackingNumber } = await req.json()
    const updateData: Record<string, string> = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (trackingNumber) updateData.trackingNumber = trackingNumber

    const order = await prisma.order.update({ where: { id }, data: updateData })
    return ok(order)
  } catch {
    return error('Failed to update order', 500)
  }
}
