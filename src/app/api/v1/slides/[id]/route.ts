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
    const fields = ['title', 'subtitle', 'description', 'buttonText', 'buttonLink', 'image', 'bgColor', 'textColor']
    for (const f of fields) if (body[f] !== undefined) data[f] = body[f]
    if (body.order !== undefined) data.order = Number(body.order)
    if (body.isActive !== undefined) data.isActive = body.isActive

    const slide = await prisma.slide.update({ where: { id }, data })
    return ok(slide)
  } catch {
    return error('Failed to update slide', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    await prisma.slide.delete({ where: { id } })
    return ok({ message: 'Slide deleted' })
  } catch {
    return notFound('Slide')
  }
}
