import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, created, unauthorized, forbidden } from '@/lib/response'

// GET /api/v1/categories
export async function GET() {
  const categories = await prisma.category.findMany({
    include: { children: true, _count: { select: { products: true } } },
    where: { parentId: null },
  })
  return ok(categories)
}

// POST /api/v1/categories  (admin only)
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const { name, slug, description, image, parentId } = await req.json()
    const category = await prisma.category.create({
      data: { name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), description, image, parentId },
    })
    return created(category)
  } catch {
    return error('Category already exists', 409)
  }
}
