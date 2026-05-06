import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ok, error } from '@/lib/response'

// POST /api/v1/auth/reset-password
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return error('Token and new password are required')
    if (password.length < 6) return error('Password must be at least 6 characters')

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return error('Reset link is invalid or has expired', 400)
    }

    const hashed = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    })

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    return ok({ message: 'Password reset successfully. You can now log in.' })
  } catch {
    return error('Failed to reset password', 500)
  }
}
