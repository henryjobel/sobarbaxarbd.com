'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { ProductType } from '@/type/ProductType';
import { cartApi, normalizeApiProduct } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CartItem extends ProductType {
    quantity: number
    selectedSize: string
    selectedColor: string
    backendId?: string
}

interface CartState {
    cartArray: CartItem[]
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: ProductType }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | { type: 'UPDATE_CART'; payload: { itemId: string; quantity: number; selectedSize: string; selectedColor: string } }
    | { type: 'LOAD_CART'; payload: CartItem[] }
    | { type: 'SET_BACKEND_ID'; payload: { productId: string; backendId: string } }
    | { type: 'CLEAR_CART' }

interface CartContextProps {
    cartState: CartState;
    addToCart: (item: ProductType) => void;
    removeFromCart: (itemId: string) => void;
    updateCart: (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const existing = state.cartArray.find(i => i.id === action.payload.id);
            if (existing) {
                return {
                    ...state,
                    cartArray: state.cartArray.map(i =>
                        i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
                    ),
                };
            }
            const newItem: CartItem = { ...action.payload, quantity: 1, selectedSize: '', selectedColor: '' };
            return { ...state, cartArray: [...state.cartArray, newItem] };
        }
        case 'REMOVE_FROM_CART':
            return { ...state, cartArray: state.cartArray.filter(item => item.id !== action.payload) };
        case 'UPDATE_CART':
            return {
                ...state,
                cartArray: state.cartArray.map(item =>
                    item.id === action.payload.itemId
                        ? { ...item, quantity: action.payload.quantity, selectedSize: action.payload.selectedSize, selectedColor: action.payload.selectedColor }
                        : item
                ),
            };
        case 'LOAD_CART':
            return { ...state, cartArray: action.payload };
        case 'SET_BACKEND_ID':
            return {
                ...state,
                cartArray: state.cartArray.map(item =>
                    item.id === action.payload.productId ? { ...item, backendId: action.payload.backendId } : item
                ),
            };
        case 'CLEAR_CART':
            return { ...state, cartArray: [] };
        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartState, dispatch] = useReducer(cartReducer, { cartArray: [] });
    const { isAuthenticated } = useAuth();

    // Sync cart from server whenever auth state changes
    useEffect(() => {
        if (!isAuthenticated) {
            dispatch({ type: 'CLEAR_CART' });
            return;
        }
        cartApi.getCart().then(items => {
            const loaded: CartItem[] = items.map(item => ({
                ...normalizeApiProduct(item.product as Parameters<typeof normalizeApiProduct>[0]),
                quantity: item.quantity,
                selectedSize: item.selectedSize ?? '',
                selectedColor: item.selectedColor ?? '',
                backendId: item.id,
            }));
            dispatch({ type: 'LOAD_CART', payload: loaded });
        }).catch(() => {});
    }, [isAuthenticated]);

    const addToCart = useCallback((item: ProductType) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
        if (isAuthenticated) {
            cartApi.addItem({ productId: item.id, quantity: 1 })
                .then(backendItem => {
                    dispatch({ type: 'SET_BACKEND_ID', payload: { productId: item.id, backendId: backendItem.id } });
                })
                .catch(() => {});
        }
    }, [isAuthenticated]);

    const removeFromCart = useCallback((itemId: string) => {
        const item = cartState.cartArray.find(i => i.id === itemId);
        dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
        if (isAuthenticated && item?.backendId) {
            cartApi.removeItem(item.backendId).catch(() => {});
        }
    }, [cartState.cartArray, isAuthenticated]);

    const updateCart = useCallback((itemId: string, quantity: number, selectedSize: string, selectedColor: string) => {
        const item = cartState.cartArray.find(i => i.id === itemId);
        dispatch({ type: 'UPDATE_CART', payload: { itemId, quantity, selectedSize, selectedColor } });
        if (isAuthenticated && item?.backendId) {
            cartApi.updateItem(item.backendId, { quantity, selectedSize, selectedColor }).catch(() => {});
        }
    }, [cartState.cartArray, isAuthenticated]);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
        if (isAuthenticated) {
            cartApi.clearCart().catch(() => {});
        }
    }, [isAuthenticated]);

    return (
        <CartContext.Provider value={{ cartState, addToCart, removeFromCart, updateCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
