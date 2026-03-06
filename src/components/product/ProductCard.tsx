'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/currency';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

interface ProductCardProps {
    product: {
        _id: string;
        title: string;
        price: number;
        discountPercent?: number;
        category: string;
        images: string[];
        rating: number;
        stock: number;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();

    const isWishlisted = isInWishlist(product._id);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isWishlisted) {
            await removeFromWishlist(product._id);
        } else {
            await addToWishlist(product._id);
        }
    };

    const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600';
    const disc = product.discountPercent ?? 0;
    const salePrice = disc > 0 ? product.price * (1 - disc / 100) : null;

    return (
        <Link href={`/products/${product._id}`} className="group relative block overflow-hidden rounded-2xl bg-surface shadow-sm transition hover:shadow-xl">
            <div className="relative aspect-square w-full overflow-hidden sm:aspect-[4/5]">
                <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity group-hover:opacity-75"
                />

                {/* Wishlist Toggle Button */}
                <button
                    onClick={toggleWishlist}
                    className="absolute right-3 top-3 z-10 p-2 rounded-full bg-surface/80 backdrop-blur-sm shadow-sm transition-all hover:scale-110 active:scale-95 group/heart"
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart
                        size={18}
                        className={`transition-colors ${isWishlisted ? 'fill-cta text-cta' : 'text-secondary-text group-hover/heart:text-cta'}`}
                    />
                </button>

                {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <span className="rounded-full bg-surface px-4 py-2 text-sm font-semibold text-foreground">
                            Out of Stock
                        </span>
                    </div>
                )}
                {/* Discount badge */}
                {disc > 0 && (
                    <div className="absolute left-3 top-3 rounded-full bg-red-500 text-white px-2.5 py-0.5 text-xs font-bold shadow">
                        {disc}% off
                    </div>
                )}
                {/* Category badge */}
                <div className="absolute right-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    {product.category}
                </div>
            </div>

            <div className="p-5 relative">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-foreground line-clamp-1">{product.title}</h3>
                    <div className="text-right shrink-0">
                        {salePrice !== null ? (
                            <>
                                <p className="text-lg font-black text-cta leading-none">{formatINR(salePrice)}</p>
                                <p className="text-xs text-secondary-text line-through mt-0.5">{formatINR(product.price)}</p>
                            </>
                        ) : (
                            <p className="text-lg font-black text-cta">{formatINR(product.price)}</p>
                        )}
                    </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                    <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-sm text-secondary-text">({product.rating})</span>
                </div>
            </div>
        </Link>
    );
}
