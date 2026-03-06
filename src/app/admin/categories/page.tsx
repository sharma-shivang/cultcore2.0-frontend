'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    GripVertical, Plus, Pencil, Trash2, Loader2,
    Check, X, Eye, EyeOff, RefreshCw,
} from 'lucide-react';

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    displayOrder: number;
    isActive: boolean;
}

// ─── Sortable row ────────────────────────────────────────────────────────────
function SortableRow({
    category,
    onEdit,
    onDelete,
    onToggleActive,
    saving,
}: {
    category: Category;
    onEdit: (c: Category) => void;
    onDelete: (id: string) => void;
    onToggleActive: (c: Category) => void;
    saving: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: category._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <tr
            ref={setNodeRef}
            style={style as React.CSSProperties}
            className={`border-b border-primary/5 hover:bg-primary/5 transition-colors ${isDragging ? 'bg-primary/10 shadow-lg' : ''}`}
        >
            {/* Drag handle */}
            <td className="px-3 py-4 w-10">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 rounded text-secondary-text hover:text-foreground hover:bg-primary/10 transition-colors touch-none"
                    title="Drag to reorder"
                >
                    <GripVertical size={18} />
                </button>
            </td>
            <td className="px-4 py-4">
                <span className="text-xs font-mono text-secondary-text bg-primary/5 px-2 py-0.5 rounded">
                    #{category.displayOrder}
                </span>
            </td>
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    {category.image && (
                        <img src={category.image} alt={category.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    )}
                    <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-secondary-text font-mono">{category.slug}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 text-sm text-secondary-text max-w-xs truncate">
                {category.description || <span className="italic opacity-40">No description</span>}
            </td>
            <td className="px-4 py-4 text-center">
                <button
                    onClick={() => onToggleActive(category)}
                    disabled={saving}
                    className={`px-2 py-1 rounded-full text-xs font-semibold transition ${category.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                >
                    {category.isActive ? <Eye size={12} className="inline mr-1" /> : <EyeOff size={12} className="inline mr-1" />}
                    {category.isActive ? 'Active' : 'Hidden'}
                </button>
            </td>
            <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onEdit(category)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-secondary-text hover:text-foreground transition-colors"
                        title="Edit"
                    >
                        <Pencil size={15} />
                    </button>
                    <button
                        onClick={() => onDelete(category._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-secondary-text hover:text-red-500 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: '', description: '', image: '', isActive: true });
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/');
            return;
        }
        if (user?.role === 'admin') fetchCategories();
    }, [user, authLoading, router]);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/admin/categories');
            setCategories(r.data.sort((a: Category, b: Category) => a.displayOrder - b.displayOrder));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Drag end handler ──────────────────────────────────────────────────────
    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = categories.findIndex(c => c._id === active.id);
        const newIndex = categories.findIndex(c => c._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        // 1. Optimistic update — rearrange and reassign displayOrder = index
        const reordered = arrayMove(categories, oldIndex, newIndex).map((cat, idx) => ({
            ...cat,
            displayOrder: idx,
        }));
        setCategories(reordered);
        setSyncStatus('saving');

        // 2. Send to backend
        try {
            await api.patch('/admin/categories/reorder', {
                items: reordered.map(c => ({ id: c._id, displayOrder: c.displayOrder })),
            });
            setSyncStatus('saved');
            setTimeout(() => setSyncStatus('idle'), 2000);
        } catch {
            setSyncStatus('error');
            // Rollback on failure
            setCategories(categories);
            setTimeout(() => setSyncStatus('idle'), 3000);
        }
    }, [categories]);

    // ── Toggle active ─────────────────────────────────────────────────────────
    const handleToggleActive = async (category: Category) => {
        // Optimistic
        setCategories(prev => prev.map(c =>
            c._id === category._id ? { ...c, isActive: !c.isActive } : c
        ));
        try {
            await api.put(`/admin/categories/${category._id}`, { isActive: !category.isActive });
        } catch {
            // Rollback
            setCategories(prev => prev.map(c =>
                c._id === category._id ? { ...c, isActive: category.isActive } : c
            ));
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category? If it has subcategories, add ?force=true to cascade delete.')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            setCategories(prev => prev.filter(c => c._id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete category');
        }
    };

    // ── Form ──────────────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null);
        setForm({ name: '', description: '', image: '', isActive: true });
        setFormError('');
        setShowForm(true);
    };

    const openEdit = (category: Category) => {
        setEditTarget(category);
        setForm({
            name: category.name,
            description: category.description || '',
            image: category.image || '',
            isActive: category.isActive,
        });
        setFormError('');
        setShowForm(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setFormError('Name is required'); return; }
        setFormLoading(true);
        setFormError('');
        try {
            if (editTarget) {
                const r = await api.put(`/admin/categories/${editTarget._id}`, form);
                setCategories(prev => prev.map(c => c._id === editTarget._id ? r.data : c));
            } else {
                const r = await api.post('/admin/categories', form);
                setCategories(prev => [...prev, r.data]);
            }
            setShowForm(false);
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'An error occurred');
        } finally {
            setFormLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    if (loading || authLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-cta" size={36} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-secondary-text mt-1">
                        Drag rows to reorder. Changes sync instantly to the backend.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Sync indicator */}
                    {syncStatus === 'saving' && (
                        <span className="flex items-center gap-1.5 text-xs text-secondary-text">
                            <Loader2 size={12} className="animate-spin" /> Saving…
                        </span>
                    )}
                    {syncStatus === 'saved' && (
                        <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                            <Check size={12} /> Saved
                        </span>
                    )}
                    {syncStatus === 'error' && (
                        <span className="flex items-center gap-1.5 text-xs text-red-500">
                            <X size={12} /> Failed — rolled back
                        </span>
                    )}
                    <button
                        onClick={fetchCategories}
                        className="flex items-center gap-2 text-sm text-secondary-text hover:text-foreground border border-primary/20 px-3 py-2 rounded-lg hover:bg-primary/5 transition"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-cta text-surface hover:bg-cta-hover px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        <Plus size={16} /> New Category
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-xl border border-primary/10 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-secondary-text">
                        <thead className="bg-primary/5 text-foreground text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-3 py-4 w-10" />
                                <th className="px-4 py-4">Order</th>
                                <th className="px-4 py-4 text-left">Name / Slug</th>
                                <th className="px-4 py-4 text-left">Description</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={categories.map(c => c._id)} strategy={verticalListSortingStrategy}>
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-secondary-text">
                                                No categories yet.{' '}
                                                <button onClick={openCreate} className="text-cta hover:underline">Create one →</button>
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map(category => (
                                            <SortableRow
                                                key={category._id}
                                                category={category}
                                                onEdit={openEdit}
                                                onDelete={handleDelete}
                                                onToggleActive={handleToggleActive}
                                                saving={saving}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </SortableContext>
                        </DndContext>
                    </table>
                </div>
            </div>

            {/* Modal form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md border border-primary/10">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10">
                            <h2 className="text-lg font-bold">{editTarget ? 'Edit Category' : 'New Category'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-primary/10 text-secondary-text transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Electronics"
                                    className="w-full bg-background border border-primary/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cta/30"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Optional description..."
                                    rows={3}
                                    className="w-full bg-background border border-primary/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cta/30 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Image URL</label>
                                <input
                                    type="url"
                                    value={form.image}
                                    onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full bg-background border border-primary/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cta/30"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-cta' : 'bg-primary/20'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
                                </button>
                                <span className="text-sm">{form.isActive ? 'Active' : 'Hidden'}</span>
                            </div>
                            {formError && (
                                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{formError}</p>
                            )}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-xl text-sm text-secondary-text hover:bg-primary/10 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-5 py-2 rounded-xl text-sm font-medium bg-cta text-surface hover:bg-cta-hover transition disabled:opacity-60 flex items-center gap-2"
                                >
                                    {formLoading && <Loader2 size={14} className="animate-spin" />}
                                    {editTarget ? 'Save changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
