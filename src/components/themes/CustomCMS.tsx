'use client'
import { useEffect, useState } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import SliderCMS from '@/components/Slider/SliderCMS'
import BannerCMS from '@/components/Banner/BannerCMS'
import Footer from '@/components/Footer/Footer'
import { useProducts } from '@/context/ProductsContext'
import Link from 'next/link'
import Product from '@/components/Product/Product'

interface Block { id: string; type: string; value: string }
interface PageBlocks { [section: string]: { [key: string]: Block } }

function usePageBlocks(page: string) {
  const [blocks, setBlocks] = useState<PageBlocks>({})
  useEffect(() => {
    fetch(`/api/v1/page-blocks?page=${page}`)
      .then(r => r.json())
      .then(res => { if (res.success) setBlocks(res.data.blocks) })
  }, [page])
  return blocks
}

function val(blocks: PageBlocks, section: string, key: string, fallback = '') {
  return blocks[section]?.[key]?.value || fallback
}

export default function CustomCMS() {
  const { products } = useProducts()
  const home = usePageBlocks('home')
  const global = usePageBlocks('global')

  const announcementText = val(home, 'announcement', 'text', 'New customers save 10% with the code GET10')
  const announcementLink = val(home, 'announcement', 'link', '/shop')

  const features = [
    {
      icon: val(home, 'features', 'feature1_icon', '🚚'),
      title: val(home, 'features', 'feature1_title', 'Free Shipping'),
      subtitle: val(home, 'features', 'feature1_subtitle', 'On orders over ৳999'),
    },
    {
      icon: val(home, 'features', 'feature2_icon', '↩️'),
      title: val(home, 'features', 'feature2_title', 'Easy Returns'),
      subtitle: val(home, 'features', 'feature2_subtitle', '30-day return policy'),
    },
    {
      icon: val(home, 'features', 'feature3_icon', '🔒'),
      title: val(home, 'features', 'feature3_title', 'Secure Payment'),
      subtitle: val(home, 'features', 'feature3_subtitle', '100% safe & secure'),
    },
    {
      icon: val(home, 'features', 'feature4_icon', '🎧'),
      title: val(home, 'features', 'feature4_title', 'Support 24/7'),
      subtitle: val(home, 'features', 'feature4_subtitle', 'Dedicated support'),
    },
  ]

  const ctaBg = val(home, 'cta', 'bgColor', '#111827')
  const ctaImg = val(home, 'cta', 'image')
  const ctaTitle = val(home, 'cta', 'title', 'Special Offer This Week')
  const ctaSubtitle = val(home, 'cta', 'subtitle', 'Up to 50% off on selected items')
  const ctaBtn = val(home, 'cta', 'buttonText', 'Shop Now')
  const ctaLink = val(home, 'cta', 'buttonLink', '/shop')

  const footerAbout = val(global, 'footer', 'about', 'Premium fashion for everyone.')
  const footerCopy = val(global, 'footer', 'copyright', `© ${new Date().getFullYear()} Anvogue. All rights reserved.`)
  const logoText = val(global, 'header', 'logo_text', 'ANVOGUE')

  const newsletter = {
    title: val(home, 'newsletter', 'title', 'Subscribe to Our Newsletter'),
    subtitle: val(home, 'newsletter', 'subtitle', 'Get the latest updates and exclusive offers'),
    placeholder: val(home, 'newsletter', 'placeholder', 'Enter your email'),
    buttonText: val(home, 'newsletter', 'buttonText', 'Subscribe'),
  }

  const featuredProducts = products.slice(0, 8)

  return (
    <>
      {/* Announcement */}
      <div className="bg-black text-white text-center py-2 text-xs">
        <Link href={announcementLink} className="hover:underline">
          {announcementText}
        </Link>
      </div>

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <SliderCMS />
      </div>

      {/* Features Strip */}
      <div className="bg-white border-b">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500">{f.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Homepage Banners */}
      <div className="container py-8">
        <BannerCMS position="home" layout="grid" className="mb-0" />
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
            <Link href="/shop" className="text-sm text-gray-500 hover:text-black transition underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((p, i) => (
              <Product key={p.id} data={p} type="grid" style="style-1" />
            ))}
          </div>
        </div>
      )}

      {/* CTA Banner */}
      {(ctaTitle || ctaImg) && (
        <div className="mx-4 md:mx-8 my-8 rounded-2xl overflow-hidden relative min-h-[240px] flex items-center"
          style={{ backgroundColor: ctaBg }}>
          {ctaImg && (
            <div className="absolute inset-0">
              <img src={ctaImg} alt="cta" className="w-full h-full object-cover opacity-40" />
            </div>
          )}
          <div className="relative z-10 p-8 md:p-14 max-w-lg">
            {ctaTitle && <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{ctaTitle}</h2>}
            {ctaSubtitle && <p className="text-white/80 mb-6">{ctaSubtitle}</p>}
            <Link href={ctaLink}
              className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition">
              {ctaBtn}
            </Link>
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="bg-gray-50 py-14">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{newsletter.title}</h2>
          <p className="text-gray-500 mb-6">{newsletter.subtitle}</p>
          <form className="flex gap-2 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder={newsletter.placeholder}
              className="flex-1 border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            <button type="submit" className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition">
              {newsletter.buttonText}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  )
}
