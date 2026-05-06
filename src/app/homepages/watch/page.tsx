'use client'

import React, { useState, useEffect } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuWatch from '@/components/Header/Menu/MenuWatch'
import SliderWatch from '@/components/Slider/SliderWatch'
import Category from '@/components/Watch/Category'
import TabFeature from '@/components/Watch/TabFeature'
import Banner from '@/components/Watch/Banner'
import Benefit from '@/components/Home1/Benefit'
import FeaturedProduct from '@/components/Watch/FeaturedProduct'
import TrendingProduct from '@/components/Watch/TrendingProduct'
import PopularProduct from '@/components/Watch/PopularProduct'
import Instagram from '@/components/Watch/Instagram'
import Brand from '@/components/Home6/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeWatch() {
    const [products, setProducts] = useState<ProductType[]>([])

    useEffect(() => {
        productsApi.getAll({ limit: '200' })
            .then(res => setProducts(res.products.map(normalizeApiProduct)))
            .catch(() => setProducts([]))
    }, [])
    return (
        <>
            <div className="bg-black style-watch">
                <TopNavOne props="style-one bg-black" slogan='New customers save 10% with the code GET10' />
                <div id="header" className='relative w-full'>
                    <MenuWatch props="bg-green" />
                    <SliderWatch />
                </div>
                <Category />
                <TabFeature data={products} start={0} limit={5} />
                <Banner />
                <FeaturedProduct data={products} />
                <TrendingProduct data={products} />
                <PopularProduct />
                <Benefit props="md:py-[60px] py-8 style-watch md:mt-20 mt-10" />
                <Instagram />
                <Brand />
                <div className="style-watch">
                    <Footer />
                </div>
            </div>
            <ModalNewsletter />
        </>
    )
}
