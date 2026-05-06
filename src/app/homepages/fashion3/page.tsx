'use client'

import React, { useState, useEffect } from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuTwo from '@/components/Header/Menu/MenuTwo'
import SliderThree from '@/components/Slider/SliderThree'
import BannerTop from '@/components/Home3/BannerTop'
import TrendingProduct from '@/components/Home3/TrendingProduct'
import Collection from '@/components/Home2/Collection'
import Benefit from '@/components/Home1/Benefit'
import FlashSale from '@/components/Home3/FlashSale'
import { blogApi } from '@/lib/api'
import NewsInsight from '@/components/Home3/NewsInsight'
import Instagram from '@/components/Home3/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'
export default function HomeThree() {
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
            <div id="header" className='relative w-full'>
                <MenuTwo />
                <BannerTop props="bg-black py-3" textColor='text-white' bgLine='bg-white' />
                <SliderThree />
            </div>
            <TrendingProduct data={products} start={10} limit={18} />
            <Collection props="md:pt-20 pt-10" />
            <FlashSale />
            <NewsInsight data={blogData} start={0} limit={3} />
            <Benefit props="md:mt-20 mt-10 py-10 px-2.5 bg-surface rounded-3xl" />
            <Instagram />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
