'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, ImageIcon } from 'lucide-react';
import ImageGalleryManager from './ImageGalleryManager';

interface Variant {
    size: string;
    color: string;
    price: number | string;
    stock: number | string;
    sku: string;
    images?: string[];
}

interface VariantManagerProps {
    variants: Variant[];
    onVariantsChange: (variants: Variant[]) => void;
    basePrice: number | string;
}

export default function VariantManager({ variants, onVariantsChange, basePrice }: VariantManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [currentVariant, setCurrentVariant] = useState<Variant>({
        size: '',
        color: '',
        price: basePrice,
        stock: '',
        sku: '',
        images: []
    });

    const [error, setError] = useState('');

    const handleAdd = () => {
        if (!currentVariant.size || !currentVariant.color || !currentVariant.sku || currentVariant.price === '' || currentVariant.stock === '') {
            setError('Please fill all variant fields');
            return;
        }

        // Check for duplicate SKU in local state
        if (variants.some(v => v.sku === currentVariant.sku)) {
            setError('Duplicate SKU in this product');
            return;
        }

        onVariantsChange([...variants, {
            ...currentVariant,
            price: Number(currentVariant.price),
            stock: Number(currentVariant.stock)
        }]);
        resetForm();
    };

    const handleUpdate = () => {
        if (editingIndex === null) return;

        if (!currentVariant.size || !currentVariant.color || !currentVariant.sku || currentVariant.price === '' || currentVariant.stock === '') {
            setError('Please fill all variant fields');
            return;
        }

        // Check for duplicate SKU (excluding the one being edited)
        if (variants.some((v, i) => v.sku === currentVariant.sku && i !== editingIndex)) {
            setError('Duplicate SKU in this product');
            return;
        }

        const updated = [...variants];
        updated[editingIndex] = {
            ...currentVariant,
            price: Number(currentVariant.price),
            stock: Number(currentVariant.stock)
        };
        onVariantsChange(updated);
        resetForm();
    };

    const removeVariant = (index: number) => {
        const updated = [...variants];
        updated.splice(index, 1);
        onVariantsChange(updated);
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setCurrentVariant({ ...variants[index] });
        setIsAdding(true);
    };

    const resetForm = () => {
        setCurrentVariant({
            size: '',
            color: '',
            price: basePrice,
            stock: '',
            sku: '',
            images: []
        });
        setIsAdding(false);
        setEditingIndex(null);
        setError('');
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-foreground">Product Variants</h3>
                {!isAdding && (
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="text-xs bg-cta text-surface px-3 py-1.5 rounded-lg font-medium hover:bg-cta-hover transition flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        Add Variant
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary-text mb-1">Size</label>
                            <select
                                value={currentVariant.size}
                                onChange={e => setCurrentVariant({ ...currentVariant, size: e.target.value })}
                                className="w-full px-3 py-1.5 bg-background border border-primary/20 rounded-lg text-sm"
                            >
                                <option value="">Select Size</option>
                                {['XS', 'S', 'M', 'L', 'XL', 'Free Size'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary-text mb-1">Color</label>
                            <input
                                type="text"
                                placeholder="e.g. Red"
                                value={currentVariant.color}
                                onChange={e => setCurrentVariant({ ...currentVariant, color: e.target.value })}
                                className="w-full px-3 py-1.5 bg-background border border-primary/20 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary-text mb-1">Price</label>
                            <input
                                type="number"
                                placeholder="99.99"
                                value={currentVariant.price}
                                onChange={e => setCurrentVariant({ ...currentVariant, price: e.target.value })}
                                className="w-full px-3 py-1.5 bg-background border border-primary/20 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary-text mb-1">Stock</label>
                            <input
                                type="number"
                                placeholder="50"
                                value={currentVariant.stock}
                                onChange={e => setCurrentVariant({ ...currentVariant, stock: e.target.value })}
                                className="w-full px-3 py-1.5 bg-background border border-primary/20 rounded-lg text-sm"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary-text mb-1">SKU</label>
                            <input
                                type="text"
                                placeholder="SKU-RED-XL"
                                value={currentVariant.sku}
                                onChange={e => setCurrentVariant({ ...currentVariant, sku: e.target.value })}
                                className="w-full px-3 py-1.5 bg-background border border-primary/20 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-secondary-text mb-2">Variant Images (Optional)</label>
                        <ImageGalleryManager
                            images={currentVariant.images || []}
                            onImagesChange={(urls) => setCurrentVariant(prev => ({ ...prev, images: urls }))}
                            maxImages={4}
                        />
                    </div>

                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="p-1.5 text-secondary-text hover:text-foreground transition"
                        >
                            <X size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={editingIndex !== null ? handleUpdate : handleAdd}
                            className="bg-foreground text-surface px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5"
                        >
                            {editingIndex !== null ? (
                                <><Check size={14} /> Update</>
                            ) : (
                                <><Plus size={14} /> Add Variant</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto border border-primary/10 rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-primary/5 text-secondary-text text-[10px] uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-4 py-3">Size</th>
                            <th className="px-4 py-3">Color</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Images</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {variants.length > 0 ? (
                            variants.map((v, i) => (
                                <tr key={i} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-4 py-3 font-medium">{v.size}</td>
                                    <td className="px-4 py-3">{v.color}</td>
                                    <td className="px-4 py-3">${v.price}</td>
                                    <td className="px-4 py-3">{v.stock}</td>
                                    <td className="px-4 py-3 font-mono text-[10px]">{v.sku}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 overflow-x-auto max-w-[100px]">
                                            {v.images && v.images.length > 0 ? (
                                                v.images.map((img, idx) => (
                                                    <img key={idx} src={img} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-secondary-text italic">Global</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(i)}
                                                className="p-1 text-secondary-text hover:text-foreground transition"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(i)}
                                                className="p-1 text-red-400 hover:text-red-500 transition"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-secondary-text italic">
                                    No variants added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
