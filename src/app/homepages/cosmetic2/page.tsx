'use client'

import React, { useState, useEffect } from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuCosmeticOne from '@/components/Header/Menu/MenuCosmeticOne'
import SliderCosmeticTwo from '@/components/Slider/SliderCosmeticTwo'
import BannerTop from '@/components/Home4/BannerTop'
import Banner from '@/components/Cosmetic2/Banner'
import CommunityStory from '@/components/Cosmetic1/CommunityStory'
import TabFeatures from '@/components/Cosmetic2/TabFeatures'
import FeaturedProduct from '@/components/Cosmetic2/FeaturedProduct'
import VideoTutorial from '@/components/Cosmetic2/VideoTutorial'
import FlashSale from '@/components/Cosmetic2/FlashSale'
import Benefit from '@/components/Cosmetic1/Benefit'
import { blogApi } from '@/lib/api'
import NewsInsight from '@/components/Cosmetic2/NewsInsight'
import Instagram from '@/components/Cosmetic1/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeCosmeticTwo() {
    const [blogData, setBlogData] = useState<any[]>([])

    useEffect(() => {
        blogApi.getAll({ limit: '100' })
            .then(({ data }) => setBlogData(data))
            .catch(() => setBlogData([]))
    }, [])

    const [products, setProducts] = useState<ProductType[]>([])

    useEffect(() => {
        productsApi.getAll({ limit: '200' })
            .then(res => setProducts(res.products.map(normalizeApiProduct)))
            .catch(() => setProducts([]))
    }, [])
    return (
        <>
            <TopNavThree props="style-three bg-white" />
            <div id="header" className='w-full relative'>
                <MenuCosmeticOne props="bg-white" />
                <BannerTop props="bg-green py-3" textColor='text-black' />
                <SliderCosmeticTwo />
            </div>
            <Banner />
            <CommunityStory />
            <TabFeatures data={products} start={0} limit={5} />
            <VideoTutorial />
            <FeaturedProduct data={products} />
            <FlashSale />
            <Benefit props="md:py-20 py-10" />
            <NewsInsight data={blogData} start={6} limit={9} />
            <Instagram />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
