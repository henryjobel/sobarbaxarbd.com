'use client'

import React, { useState, useEffect } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuMarketplace from '@/components/Header/Menu/MenuMarketplace'
import SliderMarketplace from '@/components/Slider/SliderMarketplace'
import BannerAbove from '@/components/Marketplace/BannerAbove'
import Benefit from '@/components/Home1/Benefit'
import { blogApi } from '@/lib/api'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import Deal from '@/components/Marketplace/Deal'
import Collection from '@/components/Marketplace/Collection'
import BestSeller from '@/components/Marketplace/BestSeller'
import BannerBelow from '@/components/Marketplace/BannerBelow'
import TopProduct from '@/components/Marketplace/TopProduct'
import Recommend from '@/components/Marketplace/Recommend'
import NewsInsight from '@/components/Home3/NewsInsight'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeMarketplace() {
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
            <TopNavOne props="style-marketplace bg-[#263587] border-b border-surface1" slogan='New customers save 10% with the code GET10' />
            <div id="header" className='relative w-full'>
                <MenuMarketplace />
                <SliderMarketplace />
            </div>
            <BannerAbove />
            <Deal />
            <Collection />
            <BestSeller data={products} start={0} limit={5} />
            <BannerBelow />
            <TopProduct />
            <Recommend />
            <NewsInsight data={blogData} start={18} limit={21} />
            <Benefit props='md:py-[60px] py-10 border-b border-line' />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
