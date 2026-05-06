'use client'

import React, { useState, useEffect } from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuCosmeticOne from '@/components/Header/Menu/MenuCosmeticOne'
import SliderCosmeticOne from '@/components/Slider/SliderCosmeticOne'
import BannerTop from '@/components/Home3/BannerTop'
import Collection from '@/components/Cosmetic1/Collection'
import CommunityStory from '@/components/Cosmetic1/CommunityStory'
import LookBook from '@/components/Cosmetic1/LookBook'
import BuyPack from '@/components/Cosmetic1/BuyPack'
import AdsPhoto from '@/components/Cosmetic1/AdsPhoto.jsx'
import NewArrival from '@/components/Cosmetic1/NewArrival'
import Benefit from '@/components/Cosmetic1/Benefit'
import Newsletter from '@/components/Home4/Newsletter'
import Testimonial from '@/components/Cosmetic1/Testimonial'
import Instagram from '@/components/Cosmetic1/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeCosmeticOne() {
    const [products, setProducts] = useState<ProductType[]>([])

    useEffect(() => {
        productsApi.getAll({ limit: '200' })
            .then(res => setProducts(res.products.map(normalizeApiProduct)))
            .catch(() => setProducts([]))
    }, [])
    return (
        <>
            <TopNavThree props="style-three bg-white" />
            <div id="header" className='relative w-full'>
                <MenuCosmeticOne props="bg-white" />
                <BannerTop props="bg-green py-3" textColor='text-black' bgLine='bg-black' />
                <SliderCosmeticOne />
            </div>
            <Collection />
            <CommunityStory />
            <LookBook data={products} start={8} limit={12} />
            <BuyPack />
            <AdsPhoto />
            <NewArrival data={products} start={0} limit={8} />
            <Benefit props="md:py-20 py-10" />
            <Testimonial />
            <Newsletter props="bg-transparent" />
            <Instagram />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
