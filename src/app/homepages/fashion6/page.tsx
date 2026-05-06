'use client'

import React, { useState, useEffect } from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuFour from '@/components/Header/Menu/MenuFour'
import BannerTop from '@/components/Home4/BannerTop'
import SliderSix from '@/components/Slider/SliderSix'
import Collection from '@/components/Home6/Collection'
import TabFeatures from '@/components/Home2/TabFeatures'
import PopularProduct from '@/components/Home6/PopularProduct'
import FlashSale from '@/components/Home6/FlashSale'
import testimonialData from '@/data/Testimonial.json'
import Testimonial from '@/components/Home6/Testimonial'
import BestSaleProduct from '@/components/Home6/BestSaleProduct'
import Benefit from '@/components/Home1/Benefit'
import Instagram from '@/components/Home6/Instagram'
import Brand from '@/components/Home6/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeSix() {
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
                <SliderSix />
            </div>
            <Collection />
            <TabFeatures data={products} start={0} limit={8} />
            <PopularProduct />
            <FlashSale />
            <Testimonial data={testimonialData} limit={5} />
            <BestSaleProduct data={products} />
            <Benefit props="md:pt-20 pt-10" />
            <Instagram />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
