'use client'

import React, { useState, useEffect } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEleven from '@/components/Header/Menu/MenuEleven'
import SliderEleven from '@/components/Slider/SliderEleven'
import TrendingNow from '@/components/Home11/TrendingNow'
import MenFashion from '@/components/Home11/MenFashion'
import Banner from '@/components/Home9/Banner'
import WomenFashion from '@/components/Home11/WomenFashion'
import Benefit from '@/components/Home1/Benefit'
import { blogApi } from '@/lib/api'
import NewsInsight from '@/components/Home3/NewsInsight'
import Brand from '@/components/Home1/Brand'
import Newsletter from '@/components/Home10/Newsletter'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeEleven() {
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
            <TopNavOne props="style-one bg-black" slogan='New customers save 10% with the code GET10' />
            <div id="header" className='relative w-full'>
                <MenuEleven />
                <SliderEleven />
            </div>
            <TrendingNow />
            <MenFashion data={products} start={0} limit={3} />
            <Banner />
            <WomenFashion data={products} start={0} limit={3} />
            <Benefit props="md:mt-20 mt-10 py-10 px-2.5 bg-surface rounded-[32px]" />
            <NewsInsight data={blogData} start={0} limit={3} />
            <Brand />
            <Newsletter />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
