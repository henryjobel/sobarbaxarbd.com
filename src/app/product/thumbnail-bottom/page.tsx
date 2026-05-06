'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct'
import Sale from '@/components/Product/Detail/Sale'
import Footer from '@/components/Footer/Footer'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

const ProductThumbnailBottom = () => {
    const searchParams = useSearchParams()
    const productId = searchParams.get('id') ?? ''

    const [products, setProducts] = useState<ProductType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        productsApi.getAll({ limit: '200' })
            .then(res => setProducts(res.products.map(normalizeApiProduct)))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <>
                <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
                <div id="header" className='relative w-full'>
                    <MenuOne props="bg-white" />
                </div>
                <div className="flex justify-center items-center py-40">
                    <div className="text-secondary text-lg">Loading products...</div>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-white" />
                <BreadcrumbProduct data={products} productPage='sale' productId={productId} />
            </div>
            <Sale data={products} productId={productId} />
            <Footer />
        </>
    )
}

export default ProductThumbnailBottom
