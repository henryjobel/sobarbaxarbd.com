'use client'

import React, { useState, useEffect } from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuFour from '@/components/Header/Menu/MenuFour'
import BannerTop from '@/components/Home4/BannerTop'
import SliderFive from '@/components/Slider/SliderFive'
import Banner from '@/components/Home5/Banner'
import TabFeatures from '@/components/Home2/TabFeatures'
import FlashSale from '@/components/Home5/FlashSale'
import Benefit from '@/components/Home1/Benefit'
import Newsletter from '@/components/Home4/Newsletter'
import Instagram from '@/components/Home3/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeFive() {
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
                <BannerTop props="bg-black py-3" textColor='text-white' />
                <SliderFive />
            </div>
            <Banner />
            <TabFeatures data={products} start={0} limit={8} />
            <FlashSale />
            <Benefit props="md:pt-20 pt-10" />
            <Newsletter props="bg-green md:mt-20 mt-10" />
            <Instagram />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
