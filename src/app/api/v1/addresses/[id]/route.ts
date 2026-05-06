import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, unauthorized, notFound } from '@/lib/response'

// PATCH /api/v1/addresses/:id
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const existing = await prisma.address.findFirst({ where: { id: params.id, userId: user.userId } })
  if (!existing) return notFound()

  const body = await req.json()
  const { name, phone, street, city, state, postalCode, country, isDefault } = body

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: user.userId }, data: { isDefault: false } })
  }

  const address = await prisma.address.update({
    where: { id: params.id },
    data: { name, phone, street, city, state, postalCode, country, isDefault: !!isDefault },
  })
  return ok(address)
}

// DELETE /api/v1/addresses/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const existing = await prisma.address.findFirst({ where: { id: params.id, userId: user.userId } })
  if (!existing) return notFound()

  await prisma.address.delete({ where: { id: params.id } })
  return ok({ message: 'Address deleted' })
}
