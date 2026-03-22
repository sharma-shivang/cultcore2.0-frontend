'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/axios';
import { Save, X } from 'lucide-react';
import Link from 'next/link';
import ImageGalleryManager from './ImageGalleryManager';
import VariantManager from './VariantManager';

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ProductForm({ initialData = {}, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Beauty'];

    // Local State
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category || CATEGORIES[0],
        stock: initialData.stock || '',
        images: initialData.images || [],
        discountPercent: initialData.discountPercent || 0,
        variants: initialData.variants || [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Clean up payload
            const payload = {
                ...formData,
                price: parseFloat(formData.price as string),
                stock: parseInt(formData.stock as string, 10),
                discountPercent: parseFloat(formData.discountPercent as string),
                images: formData.images,
            };

            if (isEditing) {
                await api.patch(`/products/${initialData._id}`, payload);
            } else {
                await api.post('/products', payload);
            }

            router.push('/admin/products');
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || (typeof err.response?.data?.message === 'object' ? err.response?.data?.message.join(', ') : 'Failed to save product'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 space-y-6">

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-foreground mb-2">Product Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-foreground"
                            placeholder="e.g., Wireless Noise Cancelling Headphones"
                        />
                    </div>

                    {/* Category */}
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-foreground appearance-none"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Price (USD)</label>
                        <input
                            type="number"
                            name="price"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-foreground"
                            placeholder="299.99"
                        />
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Inventory Stock</label>
                        <input
                            type="number"
                            name="stock"
                            required
                            min="0"
                            step="1"
                            value={formData.stock}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-foreground"
                            placeholder="50"
                        />
                    </div>

                    {/* Discount Percent */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Discount Percent (%)</label>
                        <input
                            type="number"
                            name="discountPercent"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.discountPercent}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-foreground"
                            placeholder="10"
                        />
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-foreground resize-y"
                            placeholder="Write a detailed description of the product..."
                        />
                    </div>

                    {/* Images */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-3">Product Images</label>
                        <ImageGalleryManager
                            images={formData.images}
                            onImagesChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                            maxImages={8}
                        />
                        <p className="text-xs text-secondary-text mt-3">Add up to 8 high-quality product images. The first image will be used as the primary thumbnail.</p>
                    </div>

                    {/* Variants */}
                    <div className="col-span-2 pt-6 border-t border-primary/10">
                        <VariantManager
                            variants={formData.variants}
                            onVariantsChange={(variants) => setFormData(prev => ({ ...prev, variants }))}
                            basePrice={formData.price}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-primary/5 px-6 py-4 border-t border-primary/10 flex items-center justify-end gap-4">
                <Link
                    href="/admin/products"
                    className="px-6 py-2 rounded-lg font-medium text-secondary-text hover:text-foreground hover:bg-black/5 transition-colors flex items-center gap-2"
                >
                    <X size={18} />
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-cta text-surface px-6 py-2 rounded-lg font-medium hover:bg-cta-hover transition flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-surface border-t-transparent rounded-full" />
                    ) : (
                        <Save size={18} />
                    )}
                    {isEditing ? 'Save Changes' : 'Publish Product'}
                </button>
            </div>
        </form>
    );
}
