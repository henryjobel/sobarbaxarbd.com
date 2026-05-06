import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, error } from '@/lib/response'

// POST /api/v1/coupons/validate
export async function POST(req: NextRequest) {
  try {
    const { code, subtotal = 0 } = await req.json()
    if (!code) return error('Coupon code is required')

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase(), isActive: true },
    })

    if (!coupon) return error('Invalid coupon code', 404)
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return error('Coupon has expired')
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return error('Coupon has reached its usage limit')
    if (subtotal < coupon.minOrder) return error(`Minimum order amount is ${coupon.minOrder}`)

    const discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
    return ok({ coupon, discount })
  } catch {
    return error('Failed to validate coupon', 500)
  }
}
