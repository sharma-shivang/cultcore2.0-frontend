'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from './AuthContext';

interface CartItem {
    product: any; // Populated Product details
    quantity: number;
    variantSku?: string;
    size?: string;
    color?: string;
}

interface CartContextType {
    items: CartItem[];
    savedItems: CartItem[];
    subtotal: number;
    loading: boolean;
    addToCart: (productId: string, quantity?: number, variantSku?: string, size?: string, color?: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number, variantSku?: string) => Promise<void>;
    removeFromCart: (productId: string, variantSku?: string) => Promise<void>;
    saveForLater: (productId: string, variantSku?: string) => Promise<void>;
    moveToCart: (productId: string, variantSku?: string) => Promise<void>;
    fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [savedItems, setSavedItems] = useState<CartItem[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await api.get('/cart');
            setItems(res.data.cart?.items || []);
            setSavedItems(res.data.cart?.savedForLater || []);
            setSubtotal(res.data.subtotal || 0);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setItems([]);
            setSavedItems([]);
            setSubtotal(0);
        }
    }, [isAuthenticated]);

    const addToCart = async (productId: string, quantity: number = 1, variantSku?: string, size?: string, color?: string) => {
        if (!isAuthenticated) {
            alert('Please login to add items to your cart.');
            return;
        }
        try {
            const res = await api.post('/cart/add', { productId, quantity, variantSku, size, color });
            setItems(res.data.cart?.items || []);
            setSavedItems(res.data.cart?.savedForLater || []);
            setSubtotal(res.data.subtotal || 0);
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            alert(error.response?.data?.message || 'Failed to add item to cart');
        }
    };

    const updateQuantity = async (productId: string, quantity: number, variantSku?: string) => {
        try {
            const res = await api.patch('/cart/update', { productId, quantity, variantSku });
            setItems(res.data.cart?.items || []);
            setSavedItems(res.data.cart?.savedForLater || []);
            setSubtotal(res.data.subtotal || 0);
        } catch (error: any) {
            console.error('Failed to update quantity:', error);
            alert(error.response?.data?.message || 'Failed to update item quantity');
            fetchCart();
        }
    };

    const removeFromCart = async (productId: string, variantSku?: string) => {
        try {
            const url = variantSku ? `/cart/remove/${productId}?variantSku=${variantSku}` : `/cart/remove/${productId}`;
            const res = await api.delete(url);
            setItems(res.data.cart?.items || []);
            setSavedItems(res.data.cart?.savedForLater || []);
            setSubtotal(res.data.subtotal || 0);
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        }
    };

    const saveForLater = async (productId: string, variantSku?: string) => {
        try {
            const url = variantSku ? `/cart/save-for-later/${productId}?variantSku=${variantSku}` : `/cart/save-for-later/${productId}`;
            const res = await api.patch(url);
            setItems(res.data.cart?.items || []);
            setSavedItems(res.data.cart?.savedForLater || []);
            setSubtotal(res.data.subtotal || 0);
        } catch (error: any) {
            console.error('Failed to save for later:', error);
            alert(error.response?.data?.message || 'Failed to save item for later');
        }
    };

    const moveToCart = async (productId: string, variantSku?: string) => {
        try {
            const url = variantSku ? `/cart/move-to-cart/${productId}?variantSku=${variantSku}` : `/cart/move-to-cart/${productId}`;
            const res = await api.patch(url);
            setItems(res.data.cart?.items || []);
            setSavedItems(res.data.cart?.savedForLater || []);
            setSubtotal(res.data.subtotal || 0);
        } catch (error: any) {
            console.error('Failed to move to cart:', error);
            alert(error.response?.data?.message || 'Failed to move item to cart');
        }
    };

    return (
        <CartContext.Provider value={{ items, savedItems, subtotal, loading, addToCart, updateQuantity, removeFromCart, saveForLater, moveToCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
