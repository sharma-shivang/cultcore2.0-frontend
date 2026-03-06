'use client';

import { useWishlist } from '@/context/WishlistContext';
import { ShoppingCart, Trash2, Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Wishlist</h1>
                    <p className="text-secondary-text mt-2">Manage your saved premium items</p>
                </div>
                <Link href="/products" className="text-cta font-medium hover:underline flex items-center gap-2">
                    Continue Shopping
                    <ArrowRight size={18} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {wishlistItems.map((product) => {
                    const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600';
                    const disc = product.discountPercent ?? 0;
                    const salePrice = disc > 0 ? product.price * (1 - disc / 100) : null;

                    return (
                        <div key={product._id} className="group flex flex-col bg-surface border border-primary/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                            {/* Image Container */}
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <Link href={`/products/${product._id}`}>
                                    <Image
                                        src={imageUrl}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </Link>
                                <button
                                    onClick={() => removeFromWishlist(product._id)}
                                    className="absolute top-3 right-3 p-2 bg-surface/80 backdrop-blur-md rounded-full text-secondary-text hover:text-red-500 transition-colors shadow-sm"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 size={18} />
                                </button>
                                {disc > 0 && (
                                    <div className="absolute left-3 top-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                        {disc}% Off
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <Link href={`/products/${product._id}`} className="font-bold text-lg leading-tight hover:text-cta transition-colors line-clamp-2">
                                            {product.title}
                                        </Link>
                                    </div>
                                    <p className="text-sm text-secondary-text mb-4 uppercase tracking-tighter font-medium">{product.category}</p>

                                    <div className="flex items-center gap-3 mb-6">
                                        {salePrice ? (
                                            <>
                                                <span className="text-xl font-black text-cta">{formatINR(salePrice)}</span>
                                                <span className="text-sm text-secondary-text line-through opacity-70">{formatINR(product.price)}</span>
                                            </>
                                        ) : (
                                            <span className="text-xl font-black text-cta">{formatINR(product.price)}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => moveToCart(product._id)}
                                        disabled={product.stock <= 0}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition shadow-sm ${product.stock > 0
                                                ? "bg-cta text-surface hover:bg-cta-hover hover:shadow-lg"
                                                : "bg-primary/10 text-secondary-text cursor-not-allowed"
                                            }`}
                                    >
                                        {product.stock > 0 ? (
                                            <>
                                                <ShoppingBag size={18} />
                                                Move to Cart
                                            </>
                                        ) : (
                                            "Out of Stock"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
