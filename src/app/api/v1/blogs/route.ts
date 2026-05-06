import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, created, error, unauthorized, forbidden } from '@/lib/response'

// GET /api/v1/blogs
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.toLowerCase()
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)

  // Admin can see all posts (drafts too) via _admin param + auth
  const user = getUserFromRequest(req)
  const isAdmin = user?.role === 'admin' && searchParams.get('_admin') === '1'

  const where: Record<string, unknown> = isAdmin ? {} : { published: true }
  if (category) where.category = category
  if (tag) where.tag = tag
  if (search) {
    const publishedFilter = isAdmin ? [] : [{ published: true }]
    where.AND = [
      ...publishedFilter,
      {
        OR: [
          { title: { contains: search } },
          { shortDesc: { contains: search } },
          { category: { contains: search } },
        ],
      },
    ]
    delete where.published
  }

  const [total, blogs] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return ok({
    data: blogs.map(parseBlog),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
}

// POST /api/v1/blogs  (admin only)
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const body = await req.json()
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        slug: body.slug || slugify(body.title),
        category: body.category,
        tag: body.tag,
        author: body.author,
        avatar: body.avatar,
        thumbImg: body.thumbImg,
        coverImg: body.coverImg,
        shortDesc: body.shortDesc,
        description: body.description,
        subImg: body.subImg ? JSON.stringify(body.subImg) : null,
        published: body.published ?? false,
      },
    })
    return created(parseBlog(blog))
  } catch {
    return error('Failed to create blog', 500)
  }
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function parseBlog(blog: Record<string, unknown>) {
  return {
    ...blog,
    subImg: blog.subImg ? JSON.parse(blog.subImg as string) : [],
  }
}
