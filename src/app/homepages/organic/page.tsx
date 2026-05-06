'use client'

import React, { useState, useEffect } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOrganic from '@/components/Header/Menu/MenuOrganic'
import SliderOrganic from '@/components/Slider/SliderOrganic'
import Category from '@/components/Organic/Category'
import Banner from '@/components/Organic/Banner'
import PopularProduct from '@/components/Organic/PopularProduct'
import BuyPack from '@/components/Organic/BuyPack'
import FlashSale from '@/components/Organic/FlashSale'
import Benefit from '@/components/Home1/Benefit'
import { blogApi } from '@/lib/api'
import NewsInsight from '@/components/Toys/NewsInsight'
import Brand from '@/components/Organic/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

export default function HomeOrganic() {
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
                <MenuOrganic />
                <SliderOrganic />
            </div>
            <Category />
            <Banner />
            <PopularProduct data={products} start={0} limit={8} />
            <BuyPack />
            <FlashSale />
            <NewsInsight data={blogData} start={15} limit={18} />
            <Benefit props="md:pb-20 pb-10" />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
