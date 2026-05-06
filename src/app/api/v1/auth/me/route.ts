import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized } from '@/lib/response'

// GET /api/v1/auth/me
export async function GET(req: NextRequest) {
  const jwtUser = getUserFromRequest(req)
  if (!jwtUser) return unauthorized()

  const user = await prisma.user.findUnique({
    where: { id: jwtUser.userId },
    select: {
      id: true, email: true, name: true, phone: true, avatar: true, role: true,
      addresses: true,
    },
  })
  if (!user) return unauthorized()
  return ok(user)
}

// PATCH /api/v1/auth/me
export async function PATCH(req: NextRequest) {
  const jwtUser = getUserFromRequest(req)
  if (!jwtUser) return unauthorized()

  try {
    const body = await req.json()
    const { name, phone, avatar, currentPassword, newPassword } = body

    const updateData: Record<string, string> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (avatar !== undefined) updateData.avatar = avatar

    if (newPassword) {
      if (!currentPassword) return error('Current password required')
      const user = await prisma.user.findUnique({ where: { id: jwtUser.userId } })
      if (!user) return unauthorized()
      const match = await bcrypt.compare(currentPassword, user.password)
      if (!match) return error('Current password is incorrect', 401)
      if (newPassword.length < 6) return error('New password must be at least 6 characters')
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const user = await prisma.user.update({
      where: { id: jwtUser.userId },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, avatar: true, role: true },
    })
    return ok(user)
  } catch {
    return error('Update failed', 500)
  }
}
