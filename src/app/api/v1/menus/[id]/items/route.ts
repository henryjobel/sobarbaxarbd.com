import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { created, error, unauthorized, forbidden, badRequest } from '@/lib/response'

// POST /api/v1/menus/[id]/items  — add item to menu
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id: menuId } = await params
  try {
    const body = await req.json()
    if (!body.label || !body.url) return badRequest('label and url required')

    const count = await prisma.menuItem.count({ where: { menuId, parentId: null } })
    const item = await prisma.menuItem.create({
      data: {
        menuId,
        label: body.label,
        url: body.url,
        target: body.target ?? '_self',
        order: body.order ?? count,
        parentId: body.parentId ?? null,
      },
    })
    return created(item)
  } catch {
    return error('Failed to add menu item', 500)
  }
}
