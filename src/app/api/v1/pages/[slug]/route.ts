import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, notFound } from '@/lib/response'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await prisma.page.findUnique({ where: { slug } })
  if (!page || page.status !== 'published') return notFound('Page')
  return ok(page)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { slug } = await params
  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    const fields = ['title', 'slug', 'content', 'excerpt', 'status', 'template', 'metaTitle', 'metaDesc']
    for (const f of fields) if (body[f] !== undefined) data[f] = body[f]

    const page = await prisma.page.update({ where: { slug }, data })
    return ok(page)
  } catch {
    return error('Failed to update page', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { slug } = await params
  try {
    await prisma.page.delete({ where: { slug } })
    return ok({ message: 'Page deleted' })
  } catch {
    return notFound('Page')
  }
}
