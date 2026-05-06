import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, notFound } from '@/lib/response'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const menu = await prisma.menu.findUnique({
    where: { id },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: { children: { orderBy: { order: 'asc' } } },
      },
    },
  })
  if (!menu) return notFound('Menu')
  return ok(menu)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    await prisma.menu.delete({ where: { id } })
    return ok({ message: 'Menu deleted' })
  } catch {
    return notFound('Menu')
  }
}
