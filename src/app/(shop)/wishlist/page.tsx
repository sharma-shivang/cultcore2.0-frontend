'use client';

import { useWishlist } from '@/context/WishlistContext';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { formatINR } from '@/lib/currency';

export default function WishlistPage() {
    const { wishlistItems, loading, removeFromWishlist, moveToCart } = useWishlist();

    if (loading && wishlistItems.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta"></div>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="bg-primary/5 p-6 rounded-full mb-6 text-cta">
                    <Heart size={48} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Your wishlist is empty</h1>
                <p className="text-secondary-text mb-8 max-w-md">
                    Save items you're interested in to your wishlist. They will show up here so you can easily add them to your cart later.
                </p>
                <Link
                    href="/products"
                    className="bg-cta text-surface hover:bg-cta-hover px-8 py-3 rounded-lg font-medium transition inline-flex items-center gap-2"
                >
                    Start Exploring
                    <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Wishlist</h1>
                    <p className="text-secondary-text mt-2">Manage your saved premium items</p>
                </div>
                <Link href="/products" className="text-cta font-medium hover:underline flex items-center gap-2">
                    Continue Shopping
                    <ArrowRight size={18} />
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product as any}
                        onMoveToCart={() => moveToCart(product._id)}
                    />
                ))}
            </div>
        </div>
    );
}
