'use client'

import React, { useState, useEffect } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuEight from '@/components/Header/Menu/MenuEight'
import SliderEight from '@/components/Slider/SliderEight'
import Collection from '@/components/Home8/Collection'
import Deal from '@/components/Home7/Deal'
import Banner from '@/components/Home8/Banner'
import TabFeatures from '@/components/Home1/TabFeatures'
import Benefit from '@/components/Home1/Benefit'
import { blogApi } from '@/lib/api'
import NewsInsight from '@/components/Home3/NewsInsight'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeEight() {
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
                <MenuEight />
                <SliderEight />
            </div>
            <Benefit props="md:pt-20 pt-10" />
            <Collection />
            <Deal data={products} start={0} limit={4} />
            <Banner />
            <TabFeatures data={products} start={0} limit={4} />
            <NewsInsight data={blogData} start={0} limit={3} />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
