'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api/axios';
import Link from 'next/link';
import { Edit2, Trash2, Plus, ExternalLink, Percent, X, Check, Loader2, Star } from 'lucide-react';
import { formatINR } from '@/lib/currency';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Discount popover state
    const [discountTarget, setDiscountTarget] = useState<any | null>(null);
    const [discountInput, setDiscountInput] = useState('');
    const [discountSaving, setDiscountSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchProducts(); }, []);

    useEffect(() => {
        if (discountTarget) {
            setDiscountInput(String(discountTarget.discountPercent ?? 0));
            setTimeout(() => inputRef.current?.select(), 50);
        }
    }, [discountTarget]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/admin');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch admin products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Delete "${title}" permanently?`)) return;
        try {
            setDeletingId(id);
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete product');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSaveDiscount = async () => {
        if (!discountTarget) return;
        const val = Number(discountInput);
        if (isNaN(val) || val < 0 || val > 100) return;
        setDiscountSaving(true);
        try {
            await api.patch(`/products/${discountTarget._id}`, { discountPercent: val });
            setProducts(prev => prev.map(p =>
                p._id === discountTarget._id ? { ...p, discountPercent: val } : p
            ));
            setDiscountTarget(null);
        } catch (e) { console.error(e); }
        finally { setDiscountSaving(false); }
    };

    const handleClearDiscount = async (product: any) => {
        try {
            await api.patch(`/products/${product._id}`, { discountPercent: 0 });
            setProducts(prev => prev.map(p =>
                p._id === product._id ? { ...p, discountPercent: 0 } : p
            ));
        } catch (e) { console.error(e); }
    };

    const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);

    const handleToggleFeatured = async (product: any) => {
        try {
            setTogglingFeaturedId(product._id);
            const newValue = !product.isFeatured;
            await api.patch(`/products/admin/${product._id}/featured`, { isFeatured: newValue });
            setProducts(prev => prev.map(p =>
                p._id === product._id ? { ...p, isFeatured: newValue } : p
            ));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to toggle featured status');
        } finally {
            setTogglingFeaturedId(null);
        }
    };

    const effectivePrice = (p: any) =>
        p.discountPercent > 0 ? p.price * (1 - p.discountPercent / 100) : p.price;

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-cta" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-secondary-text mt-1">Manage your store inventory and catalog.</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 bg-cta hover:bg-cta-hover text-surface px-4 py-2 rounded-lg font-medium transition"
                >
                    <Plus size={20} /> New Product
                </Link>
            </div>

            <div className="bg-surface rounded-xl border border-primary/10 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-secondary-text">
                        <thead className="bg-primary/5 text-foreground text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-right">Price</th>
                                <th className="px-6 py-4 text-center">Featured</th>
                                <th className="px-6 py-4 text-center">Discount</th>
                                <th className="px-6 py-4 text-center">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-primary/5 transition-colors">
                                        {/* Product */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10 overflow-hidden">
                                                    <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200'} alt={product.title} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="font-medium text-foreground truncate max-w-[180px]">{product.title}</div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-foreground">
                                                {typeof product.category === 'object' ? product.category.name : product.category}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {product.discountPercent > 0 ? (
                                                <div>
                                                    <p className="font-bold text-cta">{formatINR(effectivePrice(product))}</p>
                                                    <p className="text-xs text-secondary-text line-through">{formatINR(product.price)}</p>
                                                </div>
                                            ) : (
                                                <span className="font-medium text-foreground">{formatINR(product.price)}</span>
                                            )}
                                        </td>

                                        {/* Featured Toggle */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleToggleFeatured(product)}
                                                disabled={togglingFeaturedId === product._id}
                                                className={`p-2 rounded-full transition-all ${product.isFeatured ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-secondary-text hover:text-foreground hover:bg-primary/10'} disabled:opacity-50`}
                                                title={product.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                                            >
                                                {togglingFeaturedId === product._id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Star size={18} className={product.isFeatured ? 'fill-current' : ''} />
                                                )}
                                            </button>
                                        </td>

                                        {/* Discount badge + set button */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {discountTarget?._id === product._id ? (
                                                /* inline edit popover */
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <input
                                                        ref={inputRef}
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={discountInput}
                                                        onChange={e => setDiscountInput(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveDiscount(); if (e.key === 'Escape') setDiscountTarget(null); }}
                                                        className="w-16 px-2 py-1 text-sm border border-primary/30 rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-cta/50"
                                                    />
                                                    <span className="text-xs text-secondary-text">%</span>
                                                    <button onClick={handleSaveDiscount} disabled={discountSaving} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition">
                                                        {discountSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                                    </button>
                                                    <button onClick={() => setDiscountTarget(null)} className="p-1 text-secondary-text hover:bg-primary/10 rounded transition">
                                                        <X size={13} />
                                                    </button>
                                                </div>
                                            ) : product.discountPercent > 0 ? (
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                        <Percent size={10} />{product.discountPercent}% off
                                                    </span>
                                                    <button onClick={() => setDiscountTarget(product)} className="p-1 text-secondary-text hover:text-foreground hover:bg-primary/10 rounded transition" title="Edit discount">
                                                        <Edit2 size={11} />
                                                    </button>
                                                    <button onClick={() => handleClearDiscount(product)} className="p-1 text-secondary-text hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition" title="Remove discount">
                                                        <X size={11} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDiscountTarget(product)}
                                                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-dashed border-primary/30 text-secondary-text hover:border-cta hover:text-cta transition"
                                                >
                                                    <Percent size={11} /> Set
                                                </button>
                                            )}
                                        </td>

                                        {/* Stock */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {product.stock}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/products/${product._id}`} target="_blank" title="View" className="p-2 text-secondary-text hover:text-cta transition-colors"><ExternalLink size={18} /></Link>
                                                <Link href={`/admin/products/${product._id}/edit`} title="Edit" className="p-2 text-secondary-text hover:text-accent transition-colors"><Edit2 size={18} /></Link>
                                                <button onClick={() => handleDelete(product._id, product.title)} disabled={deletingId === product._id} title="Delete" className="p-2 text-secondary-text hover:text-red-500 transition-colors disabled:opacity-50">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
