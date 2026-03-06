'use client';

import { useEffect, useState, Suspense } from 'react';
import { api } from '@/lib/api/axios';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/product/Pagination';
import ProductSkeleton from '@/components/ProductSkeleton';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function ProductsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState<string[]>([]);

    // URL Params State
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    // Fetch active categories dynamically from backend
    useEffect(() => {
        api.get('/categories')
            .then(r => setCategories(r.data.map((c: any) => c.name)))
            .catch(() => setCategories(['Electronics', 'Fashion', 'Home', 'Accessories', 'Clothing']));
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, search, category]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '12'); // Fixed arbitrary limit
            if (search) params.append('search', search);
            if (category && category !== 'All') params.append('category', category);

            const response = await api.get(`/products?${params.toString()}`);
            setProducts(response.data.data);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(name, value);
        if (name !== 'page') {
            params.set('page', '1'); // reset page whenever new filter applies
        }
        return params.toString();
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchTerm = formData.get('search') as string;
        router.push(pathname + '?' + createQueryString('search', searchTerm));
    };

    const handleCategory = (selectedCategory: string) => {
        // Remove query completely for "All"
        if (selectedCategory === 'All') {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('category');
            params.set('page', '1');
            router.push(pathname + '?' + params.toString());
            return;
        }
        router.push(pathname + '?' + createQueryString('category', selectedCategory));
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Our Collection</h1>

                <form onSubmit={handleSearch} className="w-full md:w-auto relative">
                    <input
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="Search products..."
                        className="w-full md:w-80 pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-accent bg-surface text-foreground transition-all duration-300 ease-out hover:shadow-md focus:md:w-96 focus:shadow-lg focus:border-accent"
                    />
                    <svg className="w-5 h-5 text-secondary-text absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </form>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="mb-6">
                        <h3 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-sm">Categories</h3>
                        <div className="space-y-2">
                            {['All', ...categories].map((cat: string) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategory(cat)}
                                    className={`block w-full text-left px-3 py-2 rounded-md transition ${category === cat || (cat === 'All' && !category) ? 'bg-indigo-50 text-cta font-medium' : 'text-secondary-text hover:bg-surface hover:text-foreground'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product: any) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                            <div className="mt-12 flex justify-center">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={(newPage) => router.push(pathname + '?' + createQueryString('page', newPage.toString()))}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-primary/20">
                            <svg className="w-16 h-16 text-secondary-text mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-xl font-medium text-foreground mb-1">No products found</h3>
                            <p className="text-secondary-text">Try adjusting your category or search filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-40"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta"></div></div>}>
            <ProductsContent />
        </Suspense>
    );
}
