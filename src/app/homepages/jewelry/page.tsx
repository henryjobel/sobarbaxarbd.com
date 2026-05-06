'use client'

import React, { useState, useEffect } from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuJewelry from '@/components/Header/Menu/MenuJewelry'
import BannerTop from '@/components/Home3/BannerTop'
import SliderJewelry from '@/components/Slider/SliderJewelry'
import Quote from '@/components/Jewelry/Quote'
import Collection from '@/components/Jewelry/Collection'
import Lookbook from '@/components/Jewelry/Lookbook'
import TabFeatures from '@/components/Jewelry/TabFeatures'
import FeaturedProduct from '@/components/Jewelry/FeaturedProduct'
import Newsletter from '@/components/Home4/Newsletter'
import Benefit from '@/components/Jewelry/Benefit'
import Instagram from '@/components/Jewelry/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeJewelry() {
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
                <MenuJewelry props="bg-white" />
                <BannerTop props="bg-black py-3" textColor='text-white' bgLine='bg-white' />
                <SliderJewelry />
            </div>
            <Quote />
            <Collection />
            <Lookbook />
            <TabFeatures data={products} start={0} limit={4} />
            <FeaturedProduct data={products} />
            <Newsletter props="bg-transparent" />
            <Benefit props="py-[60px] bg-linear" />
            <Instagram />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
