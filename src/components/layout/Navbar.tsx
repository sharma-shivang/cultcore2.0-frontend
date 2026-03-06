'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { items } = useCart();
    const { wishlistItems } = useWishlist();

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    const wishlistCount = wishlistItems.length;

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center mx-auto px-4">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">
                            ElevateX
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/products"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Products
                        </Link>
                        <Link
                            href="/about"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            About
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search or other elements could go here */}
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/wishlist"
                            className="p-2 -mx-1 hover:bg-surface rounded-full transition-colors relative"
                            title="My Wishlist"
                        >
                            <Heart size={21} className={`${wishlistCount > 0 ? 'text-cta fill-cta' : 'text-secondary-text'} hover:text-cta transition-colors`} />
                            {wishlistCount > 0 && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-cta text-[9px] font-bold text-surface shadow-sm ring-2 ring-background">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/cart"
                            className="p-2 -mx-1 hover:bg-surface rounded-full transition-colors relative"
                            title="View Cart"
                        >
                            <ShoppingCart size={22} className="text-secondary-text hover:text-foreground transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-cta text-[10px] font-bold text-surface shadow-sm ring-2 ring-background">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center gap-3">
                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium text-sm"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <Link
                                    href="/account/orders"
                                    className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium text-sm"
                                >
                                    My Orders
                                </Link>
                                <button
                                    onClick={logout}
                                    className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium text-sm"
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </nav>
    );
}
