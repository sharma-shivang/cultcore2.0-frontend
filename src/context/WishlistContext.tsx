'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

interface WishlistItem {
    _id: string;
    title: string;
    price: number;
    images: string[];
    category: string;
    discountPercent: number;
    stock: number;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    loading: boolean;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    moveToCart: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const { fetchCart } = useCart();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await api.get('/wishlist');
            setWishlistItems(res.data.products || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [isAuthenticated]);

    const addToWishlist = async (productId: string) => {
        if (!isAuthenticated) {
            alert('Please login to add items to your wishlist.');
            return;
        }
        try {
            const res = await api.post('/wishlist/add', { productId });
            setWishlistItems(res.data.products || []);
        } catch (error: any) {
            console.error('Failed to add to wishlist:', error);
            alert(error.response?.data?.message || 'Failed to add item to wishlist');
        }
    };

    const removeFromWishlist = async (productId: string) => {
        try {
            const res = await api.delete(`/wishlist/remove/${productId}`);
            setWishlistItems(res.data.products || []);
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    const moveToCart = async (productId: string) => {
        try {
            const res = await api.post(`/wishlist/move-to-cart/${productId}`);
            setWishlistItems(res.data.wishlist?.products || []);
            // Update cart global state
            await fetchCart();
        } catch (error: any) {
            console.error('Failed to move to cart:', error);
            alert(error.response?.data?.message || 'Failed to move item to cart');
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlistItems.some(item => item._id === productId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            loading,
            addToWishlist,
            removeFromWishlist,
            moveToCart,
            isInWishlist,
            fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
