import React from 'react'
import { prisma } from '@/lib/prisma'
import CustomCMS from '@/components/themes/CustomCMS'
import Fashion1 from '@/components/themes/Fashion1'
import Fashion2 from '@/components/themes/Fashion2'
import Fashion3 from '@/components/themes/Fashion3'
import Fashion4 from '@/components/themes/Fashion4'
import Fashion5 from '@/components/themes/Fashion5'
import Fashion6 from '@/components/themes/Fashion6'
import Fashion7 from '@/components/themes/Fashion7'
import Fashion8 from '@/components/themes/Fashion8'
import Fashion9 from '@/components/themes/Fashion9'
import Fashion10 from '@/components/themes/Fashion10'
import Fashion11 from '@/components/themes/Fashion11'
import Cosmetic1 from '@/components/themes/Cosmetic1'
import Cosmetic2 from '@/components/themes/Cosmetic2'
import Cosmetic3 from '@/components/themes/Cosmetic3'
import Furniture from '@/components/themes/Furniture'
import Jewelry from '@/components/themes/Jewelry'
import Marketplace from '@/components/themes/Marketplace'
import Organic from '@/components/themes/Organic'
import Pet from '@/components/themes/Pet'
import Toys from '@/components/themes/Toys'
import Underwear from '@/components/themes/Underwear'
import Watch from '@/components/themes/Watch'
import Yoga from '@/components/themes/Yoga'

async function getActiveTheme(): Promise<string> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'active_theme' } })
    return setting?.value || 'fashion1'
  } catch {
    return 'fashion1'
  }
}

export default async function Home() {
  const theme = await getActiveTheme()

  const themeMap: Record<string, React.ReactNode> = {
    custom: <CustomCMS />,
    fashion1: <Fashion1 />,
    fashion2: <Fashion2 />,
    fashion3: <Fashion3 />,
    fashion4: <Fashion4 />,
    fashion5: <Fashion5 />,
    fashion6: <Fashion6 />,
    fashion7: <Fashion7 />,
    fashion8: <Fashion8 />,
    fashion9: <Fashion9 />,
    fashion10: <Fashion10 />,
    fashion11: <Fashion11 />,
    cosmetic1: <Cosmetic1 />,
    cosmetic2: <Cosmetic2 />,
    cosmetic3: <Cosmetic3 />,
    furniture: <Furniture />,
    jewelry: <Jewelry />,
    marketplace: <Marketplace />,
    organic: <Organic />,
    pet: <Pet />,
    toys: <Toys />,
    underwear: <Underwear />,
    watch: <Watch />,
    yoga: <Yoga />,
  }

  return <>{themeMap[theme] ?? themeMap['fashion1']}</>
}
