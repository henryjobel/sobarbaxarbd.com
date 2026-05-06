'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { ProductType } from '@/type/ProductType';
import { compareApi, normalizeApiProduct } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CompareItem extends ProductType {}

interface CompareState {
    compareArray: CompareItem[]
}

type CompareAction =
    | { type: 'ADD_TO_COMPARE'; payload: ProductType }
    | { type: 'REMOVE_FROM_COMPARE'; payload: string }
    | { type: 'LOAD_COMPARE'; payload: CompareItem[] }

interface CompareContextProps {
    compareState: CompareState;
    addToCompare: (item: ProductType) => void;
    removeFromCompare: (itemId: string) => void;
}

const CompareContext = createContext<CompareContextProps | undefined>(undefined);

const CompareReducer = (state: CompareState, action: CompareAction): CompareState => {
    switch (action.type) {
        case 'ADD_TO_COMPARE': {
            const exists = state.compareArray.find(i => i.id === action.payload.id);
            if (exists) return state;
            return { ...state, compareArray: [...state.compareArray, { ...action.payload }] };
        }
        case 'REMOVE_FROM_COMPARE':
            return { ...state, compareArray: state.compareArray.filter(item => item.id !== action.payload) };
        case 'LOAD_COMPARE':
            return { ...state, compareArray: action.payload };
        default:
            return state;
    }
};

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compareState, dispatch] = useReducer(CompareReducer, { compareArray: [] });
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) return;
        compareApi.getCompare().then(items => {
            const loaded: CompareItem[] = items.map(item =>
                normalizeApiProduct(item.product as unknown as Parameters<typeof normalizeApiProduct>[0])
            );
            dispatch({ type: 'LOAD_COMPARE', payload: loaded });
        }).catch(() => {});
    }, [isAuthenticated]);

    const addToCompare = useCallback((item: ProductType) => {
        dispatch({ type: 'ADD_TO_COMPARE', payload: item });
        if (isAuthenticated) {
            compareApi.addItem(item.id).catch(() => {});
        }
    }, [isAuthenticated]);

    const removeFromCompare = useCallback((itemId: string) => {
        dispatch({ type: 'REMOVE_FROM_COMPARE', payload: itemId });
        if (isAuthenticated) {
            compareApi.removeItem(itemId).catch(() => {});
        }
    }, [isAuthenticated]);

    return (
        <CompareContext.Provider value={{ compareState, addToCompare, removeFromCompare }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) throw new Error('useCompare must be used within a CompareProvider');
    return context;
};
