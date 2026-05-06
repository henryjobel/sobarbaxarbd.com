import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'

const dbPath = path.resolve(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@anvogue.com' },
    update: {},
    create: {
      email: 'admin@anvogue.com',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
    },
  })
  console.log('✅ Admin user:', admin.email)

  // Default site settings
  const defaultSettings = [
    { key: 'active_theme', value: 'fashion1' },
    { key: 'site_name', value: 'Anvogue Store' },
    { key: 'site_tagline', value: 'Your Fashion Destination' },
    { key: 'currency', value: 'BDT' },
    { key: 'currency_symbol', value: '৳' },
    { key: 'free_shipping_min', value: '500' },
    { key: 'contact_email', value: 'info@anvogue.com' },
    { key: 'contact_phone', value: '+880 1700-000000' },
  ]

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }
  console.log('✅ Site settings initialized')

  // Sample categories
  const categories = ['Fashion', 'Cosmetic', 'Furniture', 'Jewelry', 'Watch', 'Bags', 'Organic', 'Pet', 'Toys', 'Yoga', 'Marketplace']
  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: name.toLowerCase() },
      update: {},
      create: { name, slug: name.toLowerCase() },
    })
  }
  console.log('✅ Categories created')

  // Seed products from Product.json
  const productJsonPath = path.resolve(process.cwd(), 'src/data/Product.json')
  if (fs.existsSync(productJsonPath)) {
    const rawProducts = JSON.parse(fs.readFileSync(productJsonPath, 'utf-8'))

    // Build a category slug → ID map
    const categoryRows = await prisma.category.findMany({ select: { id: true, slug: true, name: true } })
    const catMap: Record<string, string> = {}
    for (const c of categoryRows) {
      catMap[c.slug] = c.id
      catMap[c.name.toLowerCase()] = c.id
    }

    let created = 0
    for (const p of rawProducts) {
      const slug = p.slug || `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.id}`
      const categoryId = catMap[p.category?.toLowerCase()] || null
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name: p.name,
          slug,
          description: p.description || '',
          price: Number(p.price) || 0,
          originPrice: Number(p.originPrice) || Number(p.price) || 0,
          categoryId,
          brand: p.brand || '',
          gender: p.gender || '',
          type: p.type || '',
          sold: Number(p.sold) || 0,
          quantity: Number(p.quantity) || 0,
          isNew: Boolean(p.new || p.isNew),
          onSale: Boolean(p.sale || p.onSale),
          rate: Number(p.rate) || 0,
          action: p.action || '',
          status: 'active',
          sizes: JSON.stringify(p.sizes || []),
          variations: JSON.stringify(p.variation || p.variations || []),
          thumbImage: JSON.stringify(p.thumbImage || []),
          images: JSON.stringify(p.images || p.thumbImage || []),
        },
      })
      created++
    }
    console.log(`✅ Products seeded: ${created}`)
  } else {
    console.log('⚠️  Product.json not found, skipping product seeding')
  }

  console.log('\n🎉 Seed complete!')
  console.log('Admin login: admin@anvogue.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
