'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Loader2, Plus, Trash2, RefreshCw, Tag, ToggleLeft, ToggleRight, Edit2, X, Check,
} from 'lucide-react';

const DISCOUNT_TYPES = ['percentage', 'fixed'] as const;

const emptyForm = {
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
    description: '',
};

export default function AdminCouponsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) router.push('/');
    }, [user, authLoading, router]);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get('/admin/coupons');
            setCoupons(r.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (user?.role === 'admin') fetchCoupons();
    }, [user, fetchCoupons]);

    const openCreate = () => {
        setForm({ ...emptyForm });
        setEditingId(null);
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (c: any) => {
        setForm({
            code: c.code,
            discountType: c.discountType,
            discountValue: String(c.discountValue),
            minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
            maxUses: c.maxUses != null ? String(c.maxUses) : '',
            expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
            isActive: c.isActive,
            description: c.description || '',
        });
        setEditingId(c._id);
        setFormError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.code || !form.discountValue) { setFormError('Code and discount value are required'); return; }
        setSaving(true);
        setFormError('');
        try {
            const payload = {
                code: form.code.toUpperCase(),
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
                maxUses: form.maxUses ? Number(form.maxUses) : undefined,
                expiresAt: form.expiresAt || undefined,
                isActive: form.isActive,
                description: form.description,
            };
            if (editingId) {
                await api.patch(`/admin/coupons/${editingId}`, payload);
            } else {
                await api.post('/admin/coupons', payload);
            }
            setShowModal(false);
            await fetchCoupons();
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to save coupon');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this coupon?')) return;
        try {
            await api.delete(`/admin/coupons/${id}`);
            setCoupons(prev => prev.filter(c => c._id !== id));
        } catch (e) { console.error(e); }
    };

    const handleToggle = async (c: any) => {
        try {
            await api.patch(`/admin/coupons/${c._id}`, { isActive: !c.isActive });
            setCoupons(prev => prev.map(x => x._id === c._id ? { ...x, isActive: !x.isActive } : x));
        } catch (e) { console.error(e); }
    };

    const isExpired = (c: any) => c.expiresAt && new Date(c.expiresAt) < new Date();
    const isExhausted = (c: any) => c.maxUses !== null && c.maxUses !== undefined && c.usedCount >= c.maxUses;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Tag size={24} className="text-cta" /> Coupons
                    </h1>
                    <p className="text-secondary-text mt-1">Create and manage discount coupons.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCoupons} disabled={loading} className="flex items-center gap-2 text-sm text-secondary-text border border-primary/20 px-3 py-2 rounded-lg hover:bg-primary/5 transition">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <button onClick={openCreate} className="flex items-center gap-2 text-sm bg-cta text-surface hover:bg-cta-hover px-4 py-2 rounded-lg font-medium transition shadow-sm">
                        <Plus size={16} /> New Coupon
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface border border-primary/10 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-secondary-text">
                        <thead className="bg-primary/5 text-foreground text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-5 py-3.5 text-left">Code</th>
                                <th className="px-5 py-3.5 text-left">Discount</th>
                                <th className="px-5 py-3.5 text-left">Min Order</th>
                                <th className="px-5 py-3.5 text-left">Usage</th>
                                <th className="px-5 py-3.5 text-left">Expires</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {loading ? (
                                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="animate-spin text-cta mx-auto" size={24} /></td></tr>
                            ) : coupons.length === 0 ? (
                                <tr><td colSpan={7} className="py-12 text-center text-secondary-text">No coupons yet. Create one!</td></tr>
                            ) : coupons.map(c => (
                                <tr key={c._id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <span className="font-mono font-bold text-foreground tracking-widest bg-primary/5 px-2 py-0.5 rounded">{c.code}</span>
                                        {c.description && <p className="text-xs text-secondary-text mt-0.5">{c.description}</p>}
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-cta">
                                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`} off
                                    </td>
                                    <td className="px-5 py-3.5">{c.minOrderAmount > 0 ? `$${c.minOrderAmount}` : '—'}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={isExhausted(c) ? 'text-red-500' : ''}>
                                            {c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ' / ∞'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {c.expiresAt
                                            ? <span className={isExpired(c) ? 'text-red-500' : ''}>{new Date(c.expiresAt).toLocaleDateString()}</span>
                                            : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <button onClick={() => handleToggle(c)} title={c.isActive ? 'Deactivate' : 'Activate'}>
                                            {c.isActive && !isExpired(c) && !isExhausted(c)
                                                ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full"><Check size={10} />Active</span>
                                                : <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary-text bg-primary/10 px-2 py-0.5 rounded-full"><X size={10} />{isExpired(c) ? 'Expired' : isExhausted(c) ? 'Exhausted' : 'Inactive'}</span>
                                            }
                                        </button>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(c)} className="p-1.5 text-secondary-text hover:text-foreground hover:bg-primary/10 rounded-lg transition"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(c._id)} className="p-1.5 text-secondary-text hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-primary/10 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-primary/10">
                            <h2 className="text-lg font-bold">{editingId ? 'Edit Coupon' : 'New Coupon'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-secondary-text hover:text-foreground hover:bg-primary/10 rounded-lg transition"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-secondary-text uppercase tracking-wider">Code *</label>
                                    <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" className="mt-1.5 w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cta/30 uppercase" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-secondary-text uppercase tracking-wider">Type *</label>
                                    <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} className="mt-1.5 w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cta/30">
                                        {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t === 'percentage' ? 'Percentage (%)' : 'Fixed ($)'}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-secondary-text uppercase tracking-wider">Value * {form.discountType === 'percentage' ? '(%)' : '($)'}</label>
                                    <input type="number" min="0" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === 'percentage' ? '20' : '15'} className="mt-1.5 w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cta/30" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-secondary-text uppercase tracking-wider">Min Order ($)</label>
                                    <input type="number" min="0" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0" className="mt-1.5 w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cta/30" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-secondary-text uppercase tracking-wider">Max Uses (blank = ∞)</label>
                                    <input type="number" min="1" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} placeholder="∞" className="mt-1.5 w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cta/30" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-secondary-text uppercase tracking-wider">Expires (blank = never)</label>
                                    <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="mt-1.5 w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cta/30" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-secondary-text uppercase tracking-wider">Description (optional)</label>
                                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Summer sale 20% off" className="mt-1.5 w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cta/30" />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded accent-cta" />
                                <span className="text-sm font-medium">Active</span>
                            </label>
                            {formError && <p className="text-sm text-red-500">{formError}</p>}
                        </div>
                        <div className="flex gap-3 p-6 border-t border-primary/10">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm border border-primary/20 rounded-xl text-secondary-text hover:bg-primary/5 transition">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-cta text-surface hover:bg-cta-hover rounded-xl font-medium transition disabled:opacity-60">
                                {saving && <Loader2 size={14} className="animate-spin" />}
                                {editingId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
