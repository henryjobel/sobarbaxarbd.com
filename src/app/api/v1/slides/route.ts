import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, created, error, unauthorized, forbidden, badRequest } from '@/lib/response'

// GET /api/v1/slides  — public, returns active slides ordered by order
export async function GET() {
  const slides = await prisma.slide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  return ok(slides)
}

// POST /api/v1/slides  — admin only
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const body = await req.json()
    if (!body.title || !body.image) return badRequest('title and image are required')

    const count = await prisma.slide.count()
    const slide = await prisma.slide.create({
      data: {
        title: body.title,
        subtitle: body.subtitle ?? null,
        description: body.description ?? null,
        buttonText: body.buttonText ?? 'Shop Now',
        buttonLink: body.buttonLink ?? '/shop',
        image: body.image,
        bgColor: body.bgColor ?? null,
        textColor: body.textColor ?? '#ffffff',
        order: body.order ?? count,
        isActive: body.isActive ?? true,
      },
    })
    return created(slide)
  } catch {
    return error('Failed to create slide', 500)
  }
}
