import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, created, error, unauthorized, forbidden, badRequest } from '@/lib/response'

// GET /api/v1/banners?position=home  — public
export async function GET(req: NextRequest) {
  const position = req.nextUrl.searchParams.get('position') ?? undefined
  const banners = await prisma.banner.findMany({
    where: { isActive: true, ...(position ? { position } : {}) },
    orderBy: { order: 'asc' },
  })
  return ok(banners)
}

// POST /api/v1/banners  — admin only
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const body = await req.json()
    if (!body.image) return badRequest('image is required')

    const count = await prisma.banner.count({ where: { position: body.position ?? 'home' } })
    const banner = await prisma.banner.create({
      data: {
        title: body.title ?? null,
        subtitle: body.subtitle ?? null,
        image: body.image,
        link: body.link ?? null,
        position: body.position ?? 'home',
        order: body.order ?? count,
        isActive: body.isActive ?? true,
      },
    })
    return created(banner)
  } catch {
    return error('Failed to create banner', 500)
  }
}
