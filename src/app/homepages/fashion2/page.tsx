'use client'

import React, { useState, useEffect } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuTwo from '@/components/Header/Menu/MenuTwo'
import SliderTwo from '@/components/Slider/SliderTwo'
import WhatNewOne from '@/components/Home1/WhatNewOne'
import Collection from '@/components/Home2/Collection'
import TabFeatures from '@/components/Home2/TabFeatures'
import Banner from '@/components/Home1/Banner'
import Benefit from '@/components/Home1/Benefit'
import Instagram from '@/components/Home1/Instagram'
import Brand from '@/components/Home1/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeTwo() {
    const [products, setProducts] = useState<ProductType[]>([])

    useEffect(() => {
        productsApi.getAll({ limit: '200' })
            .then(res => setProducts(res.products.map(normalizeApiProduct)))
            .catch(() => setProducts([]))
    }, [])
    return (
        <>
            <TopNavOne props="style-two bg-purple" slogan='Limited Offer: Free shipping on orders over $50' />
            <div id="header" className='relative w-full'>
                <MenuTwo />
                <SliderTwo />
            </div>
            <Collection props="pt-5" />
            <WhatNewOne data={products} start={0} limit={4} />
            <Banner />
            <TabFeatures data={products} start={8} limit={16} />
            <Benefit props="md:mt-20 mt-10 py-10 px-2.5 bg-surface rounded-3xl" />
            <Instagram />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
