import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden, notFound } from '@/lib/response'

// PATCH /api/v1/categories/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    const body = await req.json()
    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.image !== undefined) updateData.image = body.image
    if (body.parentId !== undefined) updateData.parentId = body.parentId || null

    const category = await prisma.category.update({ where: { id }, data: updateData })
    return ok(category)
  } catch {
    return error('Failed to update category', 500)
  }
}

// DELETE /api/v1/categories/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const { id } = await params
  try {
    // Move products to uncategorized before deleting
    await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } })
    await prisma.category.delete({ where: { id } })
    return ok({ message: 'Category deleted' })
  } catch {
    return notFound('Category')
  }
}
