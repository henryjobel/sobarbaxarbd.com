import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { ok, error, created, unauthorized, forbidden } from '@/lib/response'

// GET /api/v1/products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const type = searchParams.get('type') || undefined
    const gender = searchParams.get('gender') || undefined
    const brand = searchParams.get('brand') || undefined
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const isNew = searchParams.get('isNew') === 'true' ? true : undefined
    const onSale = searchParams.get('onSale') === 'true' ? true : undefined

    const where: Record<string, unknown> = { status: 'active' }
    if (search) where.name = { contains: search }
    if (category) where.category = { slug: category }
    if (type) where.type = type
    if (gender) where.gender = gender
    if (brand) where.brand = brand
    if (isNew !== undefined) where.isNew = isNew
    if (onSale !== undefined) where.onSale = onSale
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) (where.price as Record<string, number>).gte = minPrice
      if (maxPrice !== undefined) (where.price as Record<string, number>).lte = maxPrice
    }

    const orderBy: Record<string, string> = {}
    if (sortBy === 'price-asc') orderBy.price = 'asc'
    else if (sortBy === 'price-desc') orderBy.price = 'desc'
    else if (sortBy === 'newest') orderBy.createdAt = 'desc'
    else if (sortBy === 'best-seller') orderBy.sold = 'desc'
    else orderBy.createdAt = 'desc'

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: { select: { name: true, slug: true } } },
      }),
    ])

    return ok({
      products: products.map(parseProductJson),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch {
    return error('Failed to fetch products', 500)
  }
}

// POST /api/v1/products  (admin only)
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  try {
    const body = await req.json()
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug || slugify(body.name),
        description: body.description,
        price: Number(body.price),
        originPrice: body.originPrice ? Number(body.originPrice) : undefined,
        categoryId: body.categoryId,
        type: body.type,
        gender: body.gender,
        brand: body.brand,
        quantity: body.quantity ? Number(body.quantity) : 0,
        isNew: body.isNew ?? false,
        onSale: body.onSale ?? false,
        action: body.action,
        status: body.status || 'active',
        thumbImage: body.thumbImage ? JSON.stringify(body.thumbImage) : null,
        images: body.images ? JSON.stringify(body.images) : null,
        variations: body.variations ? JSON.stringify(body.variations) : null,
        sizes: body.sizes ? JSON.stringify(body.sizes) : null,
      },
    })
    return created(parseProductJson(product))
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') return error('Slug already exists', 409)
    return error('Failed to create product', 500)
  }
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function parseProductJson(p: Record<string, unknown>) {
  const { variations, ...rest } = p
  return {
    ...rest,
    thumbImage: rest.thumbImage ? JSON.parse(rest.thumbImage as string) : [],
    images: rest.images ? JSON.parse(rest.images as string) : [],
    variation: variations ? JSON.parse(variations as string) : [],
    sizes: rest.sizes ? JSON.parse(rest.sizes as string) : [],
  }
}
