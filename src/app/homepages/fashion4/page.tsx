'use client'

import React, { useState, useEffect } from 'react'
import TopNavThree from '@/components/Header/TopNav/TopNavThree'
import MenuFour from '@/components/Header/Menu/MenuFour'
import BannerTop from '@/components/Home4/BannerTop'
import SliderFour from '@/components/Slider/SliderFour'
import BestSellers from '@/components/Home4/BestSellers'
import Collection from '@/components/Home2/Collection'
import Banner from '@/components/Home1/Banner'
import Benefit from '@/components/Home1/Benefit'
import testimonialData from '@/data/Testimonial.json'
import Testimonial from '@/components/Home4/Testimonial'
import Newsletter from '@/components/Home4/Newsletter'
import Instagram from '@/components/Home3/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeFour() {
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
                <SliderFour />
            </div>
            <Collection props="pt-5" />
            <BestSellers data={products} start={0} limit={4} />
            <Banner />
            <Benefit props="md:pt-20 pt-10" />
            <Testimonial data={testimonialData} limit={6} />
            <Newsletter props="bg-black md:mt-20 mt-10" />
            <Instagram />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
