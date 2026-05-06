import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { ok, error, created } from '@/lib/response'

// POST /api/v1/auth/register
export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) return error('Email and password are required')
    if (password.length < 6) return error('Password must be at least 6 characters')

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return error('Email already registered', 409)

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
      select: { id: true, email: true, name: true, role: true },
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    return created({ token, user })
  } catch {
    return error('Registration failed', 500)
  }
}
