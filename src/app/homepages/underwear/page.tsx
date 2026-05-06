'use client'

import React, { useState, useEffect } from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuFour from '@/components/Header/Menu/MenuFour'
import SliderUnderwear from '@/components/Slider/SliderUnderwear'
import BannerTop from '@/components/Home3/BannerTop'
import Collection from '@/components/Underwear/Collection'
import TabFeatures from '@/components/Underwear/TabFeatures'
import FeaturedProduct from '@/components/Underwear/FeaturedProduct'
import LookBook from '@/components/Underwear/LookBook'
import TrendingProduct from '@/components/Underwear/TrendingProduct'
import testimonialData from '@/data/Testimonial.json'
import Testimonial from '@/components/Underwear/Testimonial'
import { blogApi } from '@/lib/api'
import OurBlog from '@/components/Underwear/OurBlog'
import Instagram from '@/components/Underwear/Instagram'
import Brand from '@/components/Underwear/Brand'
import Benefit from '@/components/Underwear/Benefit'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeUnderwear() {
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
                <MenuFour props="bg-white" />
                <BannerTop props="bg-black py-3" textColor='text-white' bgLine='bg-white' />
                <SliderUnderwear />
            </div>
            <Collection />
            <TabFeatures data={products} start={0} limit={4} />
            <FeaturedProduct data={products} />
            <LookBook data={products} />
            <TrendingProduct data={products} start={0} limit={8} />
            <Testimonial data={testimonialData} limit={6} />
            <OurBlog data={blogData} start={3} limit={6} />
            <Brand />
            <Instagram />
            <Benefit props="py-[60px]" />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
