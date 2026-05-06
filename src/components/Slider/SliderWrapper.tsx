'use client'
import { useCMS } from '@/context/CMSContext'
import SliderCMS from './SliderCMS'

interface Props {
  fallback: React.ReactNode
}

export default function SliderWrapper({ fallback }: Props) {
  const { hasSlides, ready } = useCMS()

  if (!ready) return (
    <div className="xl:h-[860px] lg:h-[800px] md:h-[580px] sm:h-[500px] h-[350px] w-full bg-gray-100 animate-pulse" />
  )

  if (hasSlides) return <SliderCMS />

  return <>{fallback}</>
}
