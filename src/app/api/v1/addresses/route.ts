import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, unauthorized, badRequest } from '@/lib/response'

// GET /api/v1/addresses
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const addresses = await prisma.address.findMany({ where: { userId: user.userId } })
  return ok(addresses)
}

// POST /api/v1/addresses
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const body = await req.json()
  const { name, phone, street, city, state, postalCode, country, isDefault } = body

  if (!name || !street || !city) return badRequest('name, street and city are required')

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: user.userId }, data: { isDefault: false } })
  }

  const address = await prisma.address.create({
    data: { userId: user.userId, name, phone, street, city, state, postalCode, country: country || 'BD', isDefault: !!isDefault },
  })
  return ok(address)
}
