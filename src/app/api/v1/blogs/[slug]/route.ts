import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, notFound } from '@/lib/response'
import { parseBlog } from '../route'

// GET /api/v1/blogs/[slug]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await prisma.blog.findUnique({ where: { slug } })
  if (!blog) return notFound('Blog')
  return ok(parseBlog(blog as unknown as Record<string, unknown>))
}

// PATCH /api/v1/blogs/[slug]  (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { slug } = await params
  try {
    const body = await req.json()
    const updateData: Record<string, unknown> = {}
    const fields = ['title', 'slug', 'category', 'tag', 'author', 'avatar', 'thumbImg', 'coverImg', 'shortDesc', 'description', 'published']
    for (const f of fields) if (body[f] !== undefined) updateData[f] = body[f]
    if (body.subImg !== undefined) updateData.subImg = JSON.stringify(body.subImg)

    const blog = await prisma.blog.update({ where: { slug }, data: updateData })
    return ok(parseBlog(blog as unknown as Record<string, unknown>))
  } catch {
    return error('Failed to update blog', 500)
  }
}

// DELETE /api/v1/blogs/[slug]  (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { slug } = await params
  try {
    await prisma.blog.delete({ where: { slug } })
    return ok({ message: 'Blog deleted' })
  } catch {
    return error('Failed to delete blog', 500)
  }
}
