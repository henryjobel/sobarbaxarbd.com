import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, badRequest } from '@/lib/response'

// GET /api/v1/page-blocks?page=home  — public
export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get('page')
  if (!page) return badRequest('page param required')

  const blocks = await prisma.pageBlock.findMany({ where: { page } })
  // convert to nested { section: { key: value } } map for easy frontend use
  const map: Record<string, Record<string, { id: string; type: string; value: string }>> = {}
  for (const b of blocks) {
    if (!map[b.section]) map[b.section] = {}
    map[b.section][b.key] = { id: b.id, type: b.type, value: b.value }
  }
  return ok({ page, blocks: map, raw: blocks })
}

// PUT /api/v1/page-blocks  — upsert a single block, admin only
export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const body = await req.json()
    const { page, section, key, type = 'text', value = '' } = body
    if (!page || !section || !key) return badRequest('page, section, key required')

    const block = await prisma.pageBlock.upsert({
      where: { page_section_key: { page, section, key } },
      update: { type, value },
      create: { page, section, key, type, value },
    })
    return ok(block)
  } catch {
    return error('Failed to save block', 500)
  }
}
