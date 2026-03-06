'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/axios';
import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
    const params = useParams();
    const id = params.id as string;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (err: any) {
                setError('Failed to load product details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cta"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-red-50 text-red-600 rounded-lg">
                <p className="font-medium">{error || 'Product not found'}</p>
                <Link href="/admin/products" className="text-accent underline mt-2 inline-block">
                    Return to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/products"
                    className="p-2 hover:bg-surface rounded-lg transition-colors text-secondary-text hover:text-foreground"
                >
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                    <p className="text-secondary-text mt-1">Updating Catalog ID: <span className="font-mono text-sm">{id}</span></p>
                </div>
            </div>

            <ProductForm initialData={product} isEditing={true} />
        </div>
    );
}
