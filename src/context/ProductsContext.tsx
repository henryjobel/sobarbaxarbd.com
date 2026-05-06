'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { productsApi, normalizeApiProduct } from '@/lib/api'
import { ProductType } from '@/type/ProductType'

interface ProductsContextType {
    products: ProductType[]
    loading: boolean
}

const ProductsContext = createContext<ProductsContextType>({ products: [], loading: true })

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<ProductType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        productsApi.getAll({ limit: '200' })
            .then(res => setProducts(res.products.map(normalizeApiProduct)))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))
    }, [])

    return (
        <ProductsContext.Provider value={{ products, loading }}>
            {children}
        </ProductsContext.Provider>
    )
}

export const useProducts = () => useContext(ProductsContext)
