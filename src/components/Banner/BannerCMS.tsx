'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  image: string
  link: string | null
}

interface Props {
  position?: string
  className?: string
  layout?: 'row' | 'grid'
}

export default function BannerCMS({ position = 'home', className = '', layout = 'row' }: Props) {
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    fetch(`/api/v1/banners?position=${position}`)
      .then(r => r.json())
      .then(res => { if (res.success) setBanners(res.data) })
  }, [position])

  if (!banners.length) return null

  const Wrapper = layout === 'grid' ? 'div' : 'div'

  return (
    <div className={`${layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'flex gap-4 overflow-x-auto'} ${className}`}>
      {banners.map(b => (
        <div key={b.id} className={`relative overflow-hidden rounded-xl flex-shrink-0 ${layout === 'row' ? 'w-72 h-48' : 'aspect-[4/3]'} bg-gray-100`}>
          <Image src={b.image} alt={b.title ?? 'banner'} fill className="object-cover" unoptimized />
          {(b.title || b.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
              {b.title && <p className="text-white font-semibold text-sm">{b.title}</p>}
              {b.subtitle && <p className="text-white/80 text-xs">{b.subtitle}</p>}
            </div>
          )}
          {b.link && (
            <Link href={b.link} className="absolute inset-0" aria-label={b.title ?? 'banner'} />
          )}
        </div>
      ))}
    </div>
  )
}
