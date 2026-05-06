import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, unauthorized } from '@/lib/response'

// GET /api/v1/compare
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()

  const items = await prisma.compareItem.findMany({
    where: { userId: user.userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })
  return ok(items)
}
