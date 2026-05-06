import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { ok, error } from '@/lib/response'

// POST /api/v1/auth/forgot-password
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return error('Email is required')

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to avoid user enumeration
    if (!user) {
      return ok({ message: 'If that email exists, a reset link has been sent.' })
    }

    // Invalidate existing tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    })

    // In production: send email via nodemailer/resend/sendgrid
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const resetUrl = `${siteUrl}/reset-password?token=${token}`
    console.log(`[Password Reset] URL for ${email}: ${resetUrl}`)

    return ok({ message: 'If that email exists, a reset link has been sent.' })
  } catch {
    return error('Request failed', 500)
  }
}
