'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css/bundle'

interface Slide {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  buttonText: string
  buttonLink: string
  image: string
  bgColor: string | null
  textColor: string
}

export default function SliderCMS() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/v1/slides')
      .then(r => r.json())
      .then(res => { if (res.success && res.data.length) setSlides(res.data) })
      .finally(() => setLoaded(true))
  }, [])

  // Don't render anything until we know if slides exist
  if (!loaded) return (
    <div className="xl:h-[860px] lg:h-[800px] md:h-[580px] sm:h-[500px] h-[350px] w-full bg-gray-100 animate-pulse" />
  )

  if (!slides.length) return null

  return (
    <div className="slider-block w-full xl:h-[860px] lg:h-[800px] md:h-[580px] sm:h-[500px] h-[350px]">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        pagination={{ clickable: true }}
        modules={[Pagination, Autoplay]}
        className="h-full w-full"
        autoplay={{ delay: 4500 }}
      >
        {slides.map(slide => (
          <SwiperSlide key={slide.id}>
            <div
              className="relative h-full w-full flex items-center overflow-hidden"
              style={{ backgroundColor: slide.bgColor ?? '#1a1a1a', color: slide.textColor }}
            >
              {/* Background image */}
              {slide.image && (
                <div className="absolute inset-0">
                  <Image src={slide.image} alt={slide.title} fill className="object-cover" priority unoptimized />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
              )}

              {/* Content */}
              <div className="container relative z-10">
                <div className="max-w-xl">
                  {slide.subtitle && (
                    <p className="text-sm md:text-base font-medium uppercase tracking-widest opacity-90 mb-3"
                      style={{ color: slide.textColor }}>
                      {slide.subtitle}
                    </p>
                  )}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                    style={{ color: slide.textColor }}>
                    {slide.title}
                  </h1>
                  {slide.description && (
                    <p className="mt-4 text-sm md:text-base opacity-80 max-w-md" style={{ color: slide.textColor }}>
                      {slide.description}
                    </p>
                  )}
                  <Link href={slide.buttonLink}
                    className="inline-block mt-6 md:mt-8 px-8 py-3 bg-white text-black font-semibold text-sm rounded-full hover:bg-gray-100 transition">
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
