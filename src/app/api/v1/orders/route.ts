import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, created, unauthorized } from '@/lib/response'

// GET /api/v1/orders  (user gets own orders, admin gets all)
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 10)

  const where = user.role === 'admin' ? {} : { userId: user.userId }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return ok({ orders, pagination: { total, page, limit, pages: Math.ceil(total / limit) } })
}

// POST /api/v1/orders
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  try {
    const body = await req.json()
    const { items, shipping = 0, couponCode, paymentMethod = 'cod', note, address, addressId } = body

    // If addressId provided, load address from DB
    let resolvedAddress = address
    if (addressId) {
      const dbAddr = await prisma.address.findUnique({ where: { id: addressId } })
      if (dbAddr) {
        resolvedAddress = {
          name: dbAddr.name,
          phone: dbAddr.phone,
          street: dbAddr.street,
          city: dbAddr.city,
          state: dbAddr.state,
          postalCode: dbAddr.postalCode,
          country: dbAddr.country,
        }
      }
    }

    if (!items || !items.length) return error('No items in order')

    // Validate items and calculate totals
    let subtotal = 0
    const orderItems = []
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) return error(`Product not found: ${item.productId}`)
      if (product.quantity < item.quantity) return error(`Insufficient stock for: ${product.name}`)
      subtotal += product.price * item.quantity
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: product.thumbImage ? JSON.parse(product.thumbImage)[0] : null,
      })
    }

    // Apply coupon
    let discount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase(), isActive: true },
      })
      if (coupon) {
        if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
          if (subtotal >= coupon.minOrder) {
            if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
              discount = coupon.type === 'percent'
                ? (subtotal * coupon.value) / 100
                : coupon.value
              await prisma.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } },
              })
            }
          }
        }
      }
    }

    const total = subtotal - discount + shipping

    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        subtotal,
        discount,
        shipping,
        total,
        couponCode,
        paymentMethod,
        note,
        shipName: resolvedAddress?.name,
        shipPhone: resolvedAddress?.phone,
        shipStreet: resolvedAddress?.street,
        shipCity: resolvedAddress?.city,
        shipState: resolvedAddress?.state,
        shipPostal: resolvedAddress?.postalCode,
        shipCountry: resolvedAddress?.country,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    // Decrement stock and increment sold
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity }, sold: { increment: item.quantity } },
      })
    }

    // Clear user cart
    await prisma.cartItem.deleteMany({ where: { userId: user.userId } })

    return created(order)
  } catch {
    return error('Failed to create order', 500)
  }
}
