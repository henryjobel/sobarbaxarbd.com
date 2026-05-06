import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, created, error, unauthorized, forbidden, badRequest } from '@/lib/response'

// GET /api/v1/menus?location=primary  — public
export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location') ?? undefined
  const menus = await prisma.menu.findMany({
    where: location ? { location } : {},
    include: {
      items: {
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          children: { orderBy: { order: 'asc' } },
        },
      },
    },
  })
  return ok(menus)
}

// POST /api/v1/menus  — admin only, create or upsert by location
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const body = await req.json()
    if (!body.name || !body.location) return badRequest('name and location required')

    const menu = await prisma.menu.upsert({
      where: { location: body.location },
      update: { name: body.name },
      create: { name: body.name, location: body.location },
      include: { items: { orderBy: { order: 'asc' } } },
    })
    return created(menu)
  } catch {
    return error('Failed to create menu', 500)
  }
}
