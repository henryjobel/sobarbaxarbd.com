import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, created, error, unauthorized, forbidden, badRequest } from '@/lib/response'

// GET /api/v1/pages  — public: only published; admin sees all with ?_admin=1
export async function GET(req: NextRequest) {
  const isAdmin = req.nextUrl.searchParams.get('_admin') === '1'
  const pages = await prisma.page.findMany({
    where: isAdmin ? {} : { status: 'published' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, excerpt: true, status: true, template: true, createdAt: true, updatedAt: true },
  })
  return ok(pages)
}

// POST /api/v1/pages  — admin only
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const body = await req.json()
    if (!body.title) return badRequest('title is required')

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const page = await prisma.page.create({
      data: {
        title: body.title,
        slug,
        content: body.content ?? null,
        excerpt: body.excerpt ?? null,
        status: body.status ?? 'draft',
        template: body.template ?? 'default',
        metaTitle: body.metaTitle ?? null,
        metaDesc: body.metaDesc ?? null,
      },
    })
    return created(page)
  } catch (e: unknown) {
    const msg = e instanceof Error && e.message.includes('Unique') ? 'Slug already exists' : 'Failed to create page'
    return error(msg, 500)
  }
}
