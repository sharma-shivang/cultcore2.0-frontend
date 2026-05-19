'use client';

import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/currency';

export default function CartPage() {
    const { items, savedItems, subtotal, loading, updateQuantity, removeFromCart, saveForLater, moveToCart } = useCart();

    if (loading && items.length === 0 && savedItems.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta"></div>
            </div>
        );
    }

    if (items.length === 0 && savedItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="bg-primary/5 p-6 rounded-full mb-6 text-cta">
                    <ShoppingBag size={48} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Your cart is empty</h1>
                <p className="text-secondary-text mb-8 max-w-md">
                    Looks like you haven't added anything to your cart yet. Explore our curated selection of premium products.
                </p>
                <Link
                    href="/products"
                    className="bg-cta text-surface hover:bg-cta-hover px-8 py-3 rounded-lg font-medium transition inline-flex items-center gap-2"
                >
                    Start Shopping
                    <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items List */}
                <div className="flex-1 space-y-6">
                    {items.length > 0 ? (
                        items.map((item) => {
                            const product = item.product;
                            if (!product) return null;

                            return (
                                <div key={product._id} className="flex flex-col sm:flex-row gap-6 p-6 bg-surface border border-primary/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    {/* Product Image */}
                                    <div className="w-full sm:w-32 h-32 shrink-0 bg-primary/5 rounded-xl overflow-hidden relative group">
                                        <img
                                            src={(item.variantSku && item.product?.variants?.find((v: any) => v.sku === item.variantSku)?.images?.[0]) || product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Product Details & Controls */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <Link href={`/products/${product._id}`} className="font-semibold text-lg hover:text-cta transition-colors line-clamp-2">
                                                    {product.title}
                                                </Link>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                    <p className="text-sm text-secondary-text">{typeof product.category === 'object' ? product.category.name : product.category}</p>
                                                    {item.size && (
                                                        <span className="text-sm text-secondary-text">Size: <span className="text-foreground font-medium">{item.size}</span></span>
                                                    )}
                                                    {item.color && (
                                                        <span className="text-sm text-secondary-text">Color: <span className="text-foreground font-medium">{item.color}</span></span>
                                                    )}
                                                    {product.discountPercent > 0 && (
                                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                            {product.discountPercent}% OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => saveForLater(product._id, item.variantSku)}
                                                    className="text-xs font-medium text-cta hover:text-cta-hover transition-colors"
                                                >
                                                    Save for later
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(product._id, item.variantSku)}
                                                    className="p-2 text-secondary-text hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 sm:mt-0">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center bg-background border border-primary/20 rounded-lg overflow-hidden shrink-0">
                                                <button
                                                    onClick={() => updateQuantity(product._id, item.quantity - 1, item.variantSku)}
                                                    className="px-3 py-2 text-secondary-text hover:bg-primary/5 hover:text-foreground transition-colors disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-10 text-center font-medium text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(product._id, item.quantity + 1, item.variantSku)}
                                                    className="px-3 py-2 text-secondary-text hover:bg-primary/5 hover:text-foreground transition-colors disabled:opacity-50"
                                                    disabled={item.quantity >= (item.variantSku ? (product.variants?.find((v: any) => v.sku === item.variantSku)?.stock || 0) : product.stock)}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                {product.discountPercent > 0 ? (
                                                    <>
                                                        <p className="font-bold text-lg text-cta">
                                                            {formatINR(Math.round(product.price * (1 - product.discountPercent / 100)) * item.quantity)}
                                                        </p>
                                                        <p className="text-xs text-secondary-text line-through">
                                                            {formatINR(product.price * item.quantity)}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="font-bold text-lg text-foreground">
                                                        {formatINR(product.price * item.quantity)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {item.quantity >= product.stock && (
                                            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                                Maximum stock reached
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 bg-primary/5 rounded-2xl border border-dashed border-primary/20">
                            <p className="text-secondary-text">Your active cart is currently empty.</p>
                            <Link href="/products" className="text-cta font-medium hover:underline mt-2 inline-block">
                                Continue browsing products
                            </Link>
                        </div>
                    )}

                    {/* Saved for Later Section */}
                    {savedItems.length > 0 && (
                        <div className="mt-16 pt-16 border-t border-primary/10">
                            <h2 className="text-2xl font-bold mb-8">Saved for Later</h2>
                            <div className="space-y-6">
                                {savedItems.map((item) => {
                                    const product = item.product;
                                    if (!product) return null;

                                    return (
                                        <div key={product._id} className="flex flex-col sm:flex-row gap-6 p-6 bg-surface/50 border border-primary/5 rounded-2xl grayscale-[0.5] hover:grayscale-0 transition-all opacity-80 hover:opacity-100">
                                            <div className="w-full sm:w-24 h-24 shrink-0 bg-primary/5 rounded-xl overflow-hidden">
                                                <img
                                                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <p className="font-semibold text-foreground line-clamp-1">{product.title}</p>
                                                        <p className="text-sm text-secondary-text mt-1">{formatINR(product.price)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(product._id, item.variantSku)}
                                                        className="text-secondary-text hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <button
                                                        onClick={() => moveToCart(product._id, item.variantSku)}
                                                        className="bg-cta text-surface hover:bg-cta-hover px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                                                    >
                                                        Move back to cart
                                                        <ArrowRight size={14} />
                                                    </button>
                                                    {product.stock <= 0 && (
                                                        <span className="text-xs text-red-500 font-medium">Currently out of stock</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary Checkout Panel */}
                <div className="w-full lg:w-96 shrink-0">
                    <div className="bg-surface border border-primary/10 rounded-2xl p-6 lg:p-8 sticky top-24 shadow-sm">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 text-sm text-secondary-text">
                            <div className="flex justify-between items-center">
                                <span>Subtotal</span>
                                <span className="font-medium text-foreground">{formatINR(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Shipping estimate</span>
                                <span className="font-medium text-foreground">Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Tax estimate</span>
                                <span className="font-medium text-foreground">Calculated at checkout</span>
                            </div>
                        </div>

                        <div className="border-t border-primary/10 my-6"></div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="font-semibold text-foreground">Order Total</span>
                            <span className="text-2xl font-bold text-foreground">
                                {formatINR(subtotal)}
                            </span>
                        </div>

                        <Link
                            href={items.length > 0 ? "/checkout" : "#"}
                            className={`w-full py-4 rounded-xl font-medium transition shadow-md flex items-center justify-center gap-2 ${items.length > 0
                                ? "bg-cta text-surface hover:bg-cta-hover hover:shadow-lg"
                                : "bg-primary/10 text-secondary-text cursor-not-allowed"
                                }`}
                        >
                            Proceed to Checkout
                        </Link>

                        <div className="mt-6 text-center text-sm text-secondary-text">
                            <p>Taxes and shipping calculated at checkout.</p>
                            <Link href="/products" className="text-cta hover:underline mt-2 inline-block">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
