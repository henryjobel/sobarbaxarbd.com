import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, notFound } from '@/lib/response'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.label !== undefined) data.label = body.label
    if (body.url !== undefined) data.url = body.url
    if (body.target !== undefined) data.target = body.target
    if (body.order !== undefined) data.order = Number(body.order)

    const item = await prisma.menuItem.update({ where: { id }, data })
    return ok(item)
  } catch {
    return error('Failed to update menu item', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    await prisma.menuItem.delete({ where: { id } })
    return ok({ message: 'Item deleted' })
  } catch {
    return notFound('MenuItem')
  }
}
