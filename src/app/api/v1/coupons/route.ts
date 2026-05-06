import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden } from '@/lib/response'

// GET /api/v1/coupons  (admin only)
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return ok(coupons)
}

// POST /api/v1/coupons  (admin only)
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const body = await req.json()
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type || 'percent',
        value: Number(body.value),
        minOrder: Number(body.minOrder || 0),
        maxUses: body.maxUses ? Number(body.maxUses) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive ?? true,
      },
    })
    return ok(coupon)
  } catch {
    return error('Coupon code already exists or invalid data', 409)
  }
}
