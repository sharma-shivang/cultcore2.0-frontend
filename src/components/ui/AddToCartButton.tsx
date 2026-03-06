'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface AddToCartButtonProps {
    productId: string;
    stock: number;
    className?: string;
}

export default function AddToCartButton({ productId, stock, className = '' }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        setLoading(true);
        await addToCart(productId, 1);
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
