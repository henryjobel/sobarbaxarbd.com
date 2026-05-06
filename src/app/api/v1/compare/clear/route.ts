import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, unauthorized } from '@/lib/response'

// DELETE /api/v1/compare/clear  — clear all compare items
export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  await prisma.compareItem.deleteMany({ where: { userId: user.userId } })
  return ok({ message: 'Compare cleared' })
}
