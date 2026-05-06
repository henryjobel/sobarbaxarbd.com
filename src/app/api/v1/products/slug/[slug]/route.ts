import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, notFound } from '@/lib/response'
import { parseProductJson } from '../../route'

// GET /api/v1/products/slug/[slug]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, reviews: { include: { user: { select: { name: true, avatar: true } } } } },
  })
  if (!product) return notFound('Product')
  return ok(parseProductJson(product as Record<string, unknown>))
}
