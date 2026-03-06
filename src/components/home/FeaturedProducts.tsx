'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/axios';
import ProductCard from '@/components/product/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await api.get('/products/featured?limit=4');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching featured products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-10">
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-primary/10 rounded-full animate-pulse"></div>
                            <div className="h-10 w-64 bg-primary/10 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-cta/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cta/10 text-cta text-xs font-bold uppercase tracking-widest">
                            <Star className="w-3 h-3 fill-current" />
                            Curated Selection
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                            Featured <span className="text-cta">Arrivals</span>
                        </h2>
                        <p className="text-secondary-text max-w-xl text-lg">
                            Handpicked premium products designed to elevate your lifestyle with unmatched quality and style.
                        </p>
                    </div>

                    <Link
                        href="/products"
                        className="group flex items-center gap-2 text-foreground font-bold hover:text-cta transition-colors text-lg"
                    >
                        View All Collection
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <div key={product._id} className="transform transition-all duration-500 hover:-translate-y-2">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
