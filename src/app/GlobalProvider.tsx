import React from 'react'
import { CMSProvider } from '@/context/CMSContext'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ModalCartProvider } from '@/context/ModalCartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { ModalWishlistProvider } from '@/context/ModalWishlistContext'
import { CompareProvider } from '@/context/CompareContext'
import { ModalCompareProvider } from '@/context/ModalCompareContext'
import { ModalSearchProvider } from '@/context/ModalSearchContext'
import { ModalQuickviewProvider } from '@/context/ModalQuickviewContext'
import { ProductsProvider } from '@/context/ProductsContext'

const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <CMSProvider>
        <AuthProvider>
            <ProductsProvider>
                <CartProvider>
                    <ModalCartProvider>
                        <WishlistProvider>
                            <ModalWishlistProvider>
                                <CompareProvider>
                                    <ModalCompareProvider>
                                        <ModalSearchProvider>
                                            <ModalQuickviewProvider>
                                                {children}
                                            </ModalQuickviewProvider>
                                        </ModalSearchProvider>
                                    </ModalCompareProvider>
                                </CompareProvider>
                            </ModalWishlistProvider>
                        </WishlistProvider>
                    </ModalCartProvider>
                </CartProvider>
            </ProductsProvider>
        </AuthProvider>
        </CMSProvider>
    )
}

export default GlobalProvider