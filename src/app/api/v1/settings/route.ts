import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, unauthorized, forbidden } from '@/lib/response'

// GET /api/v1/settings
export async function GET() {
  const settings = await prisma.siteSetting.findMany()
  const result: Record<string, string> = {}
  for (const s of settings) result[s.key] = s.value
  return ok(result)
}

// PATCH /api/v1/settings  (admin only)
export async function PATCH(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const body = await req.json()
    const updates = await Promise.all(
      Object.entries(body).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    )
    return ok(updates)
  } catch {
    return error('Failed to update settings', 500)
  }
}
