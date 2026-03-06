'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Check, X, Trash2, Star, RefreshCw, ShieldCheck, ChevronDown } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function StarDisplay({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={12} className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-primary/20'} />
            ))}
        </div>
    );
}

export default function AdminReviewsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [reviews, setReviews] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [actingId, setActingId] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [productId, setProductId] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) router.push('/');
    }, [user, authLoading, router]);

    // Load all categories once
    useEffect(() => {
        if (user?.role === 'admin') {
            api.get('/admin/categories')
                .then(r => setCategories(r.data))
                .catch(console.error);
        }
    }, [user]);

    // When category changes — load products in that category
    useEffect(() => {
        setProductId('');  // reset product selection
        if (!categoryId) { setProducts([]); return; }

        setProductsLoading(true);
        // Get the selected category name and fetch products with that category
        const cat = categories.find(c => c._id === categoryId);
        if (!cat) { setProductsLoading(false); return; }

        api.get(`/products?category=${encodeURIComponent(cat.name)}&limit=100`)
            .then(r => setProducts(r.data.data || r.data))
            .catch(console.error)
            .finally(() => setProductsLoading(false));
    }, [categoryId, categories]);

    const fetchReviews = useCallback(async () => {
        if (!user?.role) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            if (categoryId) params.set('categoryId', categoryId);
            if (productId) params.set('productId', productId);

            const r = await api.get(`/admin/reviews?${params.toString()}`);
            setReviews(r.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [user, statusFilter, categoryId, productId]);

    useEffect(() => {
        if (user?.role === 'admin') fetchReviews();
    }, [user, statusFilter, categoryId, productId, fetchReviews]);

    const moderate = async (id: string, status: 'approved' | 'rejected') => {
        setActingId(id);
        try {
            await api.patch(`/admin/reviews/${id}/moderate`, { status });
            // Update in place — keep the review visible with updated status
            setReviews(prev => prev.map(r => r._id === id ? { ...r, status } : r));
        } catch (e) { console.error(e); }
        finally { setActingId(null); }
    };

    const deleteReview = async (id: string) => {
        if (!confirm('Delete this review permanently?')) return;
        setActingId(id);
        try {
            await api.delete(`/admin/reviews/${id}`);
            setReviews(prev => prev.filter(r => r._id !== id));
        } catch (e) { console.error(e); }
        finally { setActingId(null); }
    };

    const selectedCategoryName = categories.find(c => c._id === categoryId)?.name;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck size={26} className="text-cta" /> Review Moderation
                    </h1>
                    <p className="text-secondary-text mt-1">
                        {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                        {selectedCategoryName ? ` in ${selectedCategoryName}` : ''}
                        {productId ? ` for selected product` : ''}
                    </p>
                </div>
                <button
                    onClick={fetchReviews}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm text-secondary-text hover:text-foreground border border-primary/20 px-3 py-2 rounded-lg hover:bg-primary/5 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Filter bar */}
            <div className="bg-surface border border-primary/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
                {/* Status filter pills */}
                <div className="flex items-center gap-1.5">
                    {([['', 'All'], ['approved', 'Approved'], ['rejected', 'Rejected']] as const).map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setStatusFilter(val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${statusFilter === val ? 'bg-cta text-surface shadow-sm' : 'text-secondary-text hover:bg-primary/10'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="w-px h-5 bg-primary/15 hidden sm:block" />

                {/* Category dropdown */}
                <div className="relative">
                    <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        className="appearance-none bg-background border border-primary/20 rounded-lg pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cta/30 min-w-[150px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-secondary-text pointer-events-none" />
                </div>

                {/* Product dropdown — only shown when a category is selected */}
                {categoryId && (
                    <div className="relative">
                        {productsLoading ? (
                            <Loader2 size={14} className="animate-spin text-cta mt-1.5 ml-2" />
                        ) : (
                            <>
                                <select
                                    value={productId}
                                    onChange={e => setProductId(e.target.value)}
                                    className="appearance-none bg-background border border-primary/20 rounded-lg pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cta/30 min-w-[180px]"
                                >
                                    <option value="">All Products in Category</option>
                                    {products.map((p: any) => (
                                        <option key={p._id} value={p._id}>{p.title}</option>
                                    ))}
                                </select>
                                <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-secondary-text pointer-events-none" />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Reviews list */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cta" size={32} /></div>
            ) : reviews.length === 0 ? (
                <div className="bg-surface border border-dashed border-primary/20 rounded-2xl py-16 text-center text-secondary-text">
                    No reviews found for the selected filters.
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map(review => (
                        <div key={review._id} className="bg-surface border border-primary/10 rounded-2xl p-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                {/* Product thumbnail */}
                                <div className="w-14 h-14 rounded-xl bg-primary/5 overflow-hidden shrink-0 border border-primary/10">
                                    <img
                                        src={review.product?.images?.[0] || 'https://via.placeholder.com/56'}
                                        alt={review.product?.title}
                                        className="w-full h-full object-cover"
                                        onError={e => (e.currentTarget.src = 'https://via.placeholder.com/56')}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                        <div>
                                            <p className="font-semibold text-foreground text-sm">{review.product?.title || 'Product'}</p>
                                            <p className="text-xs text-secondary-text mt-0.5">
                                                Category: <span className="text-foreground/70">{review.product?.category || '—'}</span>
                                                {' · '}by <span className="text-foreground font-medium">{review.user?.name}</span>
                                                {' '}
                                                <span className="opacity-60">({review.user?.email})</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_STYLES[review.status] || 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {review.status}
                                            </span>
                                            <span className="text-xs text-secondary-text">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-1">
                                        <StarDisplay value={review.rating} />
                                        {review.verifiedPurchase && (
                                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                                <Check size={10} /> Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-secondary-text mt-2 leading-relaxed">{review.comment}</p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {actingId === review._id ? (
                                        <Loader2 size={18} className="animate-spin text-cta" />
                                    ) : (
                                        <>
                                            {review.status !== 'approved' && (
                                                <button
                                                    onClick={() => moderate(review._id, 'approved')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 text-xs font-medium transition"
                                                >
                                                    <Check size={13} /> Approve
                                                </button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <button
                                                    onClick={() => moderate(review._id, 'rejected')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-xs font-medium transition"
                                                >
                                                    <X size={13} /> Reject
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteReview(review._id)}
                                                className="p-1.5 rounded-lg text-secondary-text hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                                title="Delete permanently"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
