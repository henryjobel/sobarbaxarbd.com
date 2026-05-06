import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, notFound } from '@/lib/response'
import { parseProductJson } from '../../route'

// GET /api/v1/products/[id]/related
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return notFound('Product')

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: id },
      status: 'active',
    },
    take: 8,
  })
  return ok(related.map(p => parseProductJson(p as Record<string, unknown>)))
}
