'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface AddToCartButtonProps {
    productId: string;
    stock: number;
    variant?: any;
    size?: string;
    color?: string;
    className?: string;
}

export default function AddToCartButton({ productId, stock, variant, size, color, className = '' }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        setLoading(true);
        await addToCart(productId, 1, variant?.sku, size, color);
        setLoading(false);
    };

    if (stock <= 0) {
        return (
            <button
                disabled
                className={`w-full py-3 px-6 rounded-lg font-medium bg-secondary-text shadow-sm cursor-not-allowed ${className}`}
            >
                Out of Stock
            </button>
        );
    }

    return (
        <button
            onClick={handleAdd}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 bg-cta text-surface hover:bg-cta-hover transition-colors shadow-sm disabled:opacity-75 ${className}`}
        >
            {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-surface border-t-transparent rounded-full" />
            ) : (
                <>
                    <ShoppingCart size={20} />
                    Add to Cart
                </>
            )}
        </button>
    );
}
