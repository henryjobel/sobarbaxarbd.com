import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { ok, error } from '@/lib/response'

// POST /api/v1/auth/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return error('Email and password are required')

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return error('Invalid credentials', 401)

    const match = await bcrypt.compare(password, user.password)
    if (!match) return error('Invalid credentials', 401)

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    return ok({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, phone: user.phone },
    })
  } catch {
    return error('Login failed', 500)
  }
}
