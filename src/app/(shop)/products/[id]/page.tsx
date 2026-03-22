'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AddToCartButton from '@/components/ui/AddToCartButton';
import ProductReviews from '@/components/product/ProductReviews';
import ProductCard from '@/components/product/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { formatINR } from '@/lib/currency';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingRelated, setLoadingRelated] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    // Variants State
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [currentVariant, setCurrentVariant] = useState<any>(null);

    useEffect(() => {
        fetchProduct();
        fetchRelated();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${params.id}`);
            const data = response.data;
            setProduct(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    // Update current variant when selection changes
    useEffect(() => {
        if (product?.variants?.length > 0) {
            const variant = product.variants.find(
                (v: any) => v.size === selectedSize && v.color === selectedColor
            );
            setCurrentVariant(variant || null);
        }
    }, [selectedSize, selectedColor, product]);

    useEffect(() => {
        if (product?.variants?.length > 0) {
            setSelectedSize(product.variants[0].size);
            setSelectedColor(product.variants[0].color);
        }
    }, [product]);

    // Update selected image when variant changes
    useEffect(() => {
        if (currentVariant?.images?.length > 0) {
            setSelectedImage(currentVariant.images[0]);
        } else if (product?.images?.length > 0 && !selectedImage) {
            setSelectedImage(product.images[0]);
        }
    }, [currentVariant?.sku, product]);

    const fetchRelated = async () => {
        try {
            setLoadingRelated(true);
            const response = await api.get(`/products/${params.id}/related?limit=4`);
            setRelatedProducts(response.data);
        } catch (err) {
            console.error('Failed to fetch related products:', err);
        } finally {
            setLoadingRelated(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            setIsDeleting(true);
            await api.delete(`/products/${params.id}`);
            window.location.href = '/products';
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">{error || 'Product not found'}</h2>
                <Link href="/products" className="text-cta hover:text-indigo-800 font-medium">
                    &larr; Back to Products
                </Link>
            </div>
        );
    }

    const imageUrl = selectedImage || (currentVariant?.images?.[0]) || product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800';
    const disc = product.discountPercent ?? 0;

    // Derived Images
    const displayImages = (currentVariant?.images?.length > 0) ? currentVariant.images : product.images;
    // Availability Helpers
    const isColorAvailable = (color: string) => {
        if (!product.variants) return true;
        // A color is available if any variant with this color is in stock
        return product.variants.some((v: any) => v.color === color && v.stock > 0);
    };

    const isSizeAvailableForColor = (size: string, color: string | null) => {
        if (!product.variants) return true;
        if (!color) return true;
        // A size is available for a color if the specific variant is in stock
        return product.variants.some((v: any) => v.color === color && v.size === size && v.stock > 0);
    };
    // Derived Price & Stock
    const displayPrice = currentVariant ? currentVariant.price : product.price;
    const displayStock = currentVariant ? currentVariant.stock : product.stock;
    const salePrice = disc > 0 ? displayPrice * (1 - disc / 100) : null;

    // Group variants for UI
    const availableSizes = Array.from(new Set(product.variants?.map((v: any) => v.size) || [])) as string[];
    const availableColors = Array.from(new Set(product.variants?.map((v: any) => v.color) || [])) as string[];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Navigation */}
            <nav className="mb-8">
                <Link href="/products" className="text-sm font-medium text-secondary-text hover:text-foreground inline-flex items-center transition">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Collection
                </Link>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {/* Product Image & Gallery */}
                <div className="space-y-6">
                    <div className="aspect-square w-full rounded-2xl bg-surface overflow-hidden relative shadow-md">
                        <img src={imageUrl} alt={product.title} className="absolute inset-0 w-full h-full object-cover transition-all duration-300" />
                        <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-foreground">
                            {product.category}
                        </div>
                        {disc > 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow">
                                {disc}% off
                            </div>
                        )}
                        {product.stock === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <span className="bg-surface text-foreground px-6 py-3 rounded-full font-bold shadow-lg">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {displayImages && displayImages.length > 1 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {displayImages.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img
                                        ? 'border-cta shadow-md scale-105'
                                        : 'border-primary/10 hover:border-cta/50 opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt={`${product.title} ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight sm:leading-snug mb-4">
                        {product.title}
                    </h1>

                    {/* Price */}
                    <div className="mb-6">
                        {salePrice !== null ? (
                            <div className="flex items-center gap-4 flex-wrap">
                                <p className="text-3xl font-black text-cta">{formatINR(salePrice)}</p>
                                <div>
                                    <p className="text-base text-secondary-text line-through">{formatINR(displayPrice)}</p>
                                    <span className="inline-block bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {disc}% off
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-3xl font-black text-cta">{formatINR(displayPrice)}</p>
                        )}
                    </div>

                    {/* Variant Selection */}
                    {product.variants?.length > 0 && (
                        <div className="space-y-6 mb-8 pt-6 border-t border-primary/10">
                            {/* Color Selection */}
                            {availableColors.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Color</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {availableColors.map(color => {
                                            const isAvailable = isColorAvailable(color);
                                            return (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    disabled={!isAvailable}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${selectedColor === color
                                                        ? 'border-cta bg-cta/5 text-cta'
                                                        : isAvailable
                                                            ? 'border-primary/10 hover:border-primary/30 text-secondary-text'
                                                            : 'border-primary/5 bg-primary/5 text-secondary-text/30 cursor-not-allowed line-through'
                                                        }`}
                                                >
                                                    {color}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {availableSizes.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Size</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map(size => {
                                            const isAvailable = isSizeAvailableForColor(size, selectedColor);
                                            return (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    disabled={!isAvailable}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${selectedSize === size
                                                        ? 'border-cta bg-cta/5 text-cta'
                                                        : isAvailable
                                                            ? 'border-primary/10 hover:border-primary/30 text-secondary-text'
                                                            : 'border-primary/5 bg-primary/5 text-secondary-text/30 cursor-not-allowed line-through'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center mb-6">
                        <div className="flex text-yellow-500 mr-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <svg key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-sm font-medium text-secondary-text">({product.rating} / 5)</span>
                    </div>

                    <div className="prose prose-sm prose-gray max-w-none mb-8">
                        <p className="text-secondary-text leading-relaxed text-lg">{product.description}</p>
                    </div>

                    {/* Action Area */}
                    <div className="mt-8 pt-8 border-t border-primary/10">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <AddToCartButton
                                productId={product._id}
                                stock={displayStock}
                                variant={currentVariant}
                                size={selectedSize || undefined}
                                color={selectedColor || undefined}
                            />
                        </div>
                        {displayStock > 0 ? (
                            <p className="mt-4 text-sm text-secondary-text text-center flex items-center justify-center">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                {displayStock} items available. Ready to ship.
                            </p>
                        ) : (
                            <p className="mt-4 text-sm text-red-500 text-center font-medium">
                                Selected combination is currently out of stock.
                            </p>
                        )}
                    </div>

                    {/* Admin Controls */}
                    {user?.role === 'admin' && (
                        <div className="mt-12 bg-red-50 p-6 rounded-xl border border-red-100">
                            <h4 className="text-red-800 font-semibold mb-2">Admin Area</h4>
                            <p className="text-red-600 text-sm mb-4">You have special privileges to manage this entity.</p>
                            <div className="flex gap-4">
                                <button
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    className="bg-surface text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Product'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products Section */}
            <div className="mt-20 pt-10 border-t border-primary/10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Related Products</h2>
                        <p className="text-secondary-text">You might also like these premium selections</p>
                    </div>
                    <Link href={`/products?category=${product.category}`} className="text-cta font-bold hover:text-cta/80 transition-colors flex items-center group">
                        See All
                        <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>

                {loadingRelated ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : relatedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface rounded-2xl p-12 text-center border border-primary/5">
                        <p className="text-secondary-text">No related products found in this category.</p>
                    </div>
                )}
            </div>

            {/* Reviews */}
            <ProductReviews productId={params.id} />
        </div>
    );
}
