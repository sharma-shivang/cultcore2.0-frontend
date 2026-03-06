'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ExternalLink, Loader2, RefreshCw,
    ArrowDown, ArrowUp, Filter, DollarSign, ShoppingBag, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { formatINR } from '@/lib/currency';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface Category { _id: string; name: string; }

export default function AdminOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Filter / sort / pagination state
    const [categoryId, setCategoryId] = useState('');
    const [sortBy, setSortBy] = useState<'createdAt' | 'total'>('createdAt');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);

    const LIMIT = 10;

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/');
            return;
        }
        if (user?.role === 'admin') {
            // Load categories for filter dropdown
            api.get('/admin/categories')
                .then(r => setCategories(r.data))
                .catch(console.error);
        }
    }, [user, authLoading, router]);

    const fetchOrders = useCallback(async (resetPage = false) => {
        const targetPage = resetPage ? 1 : page;
        if (resetPage) setPage(1);
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sortBy,
                order: sortDir,
                page: String(targetPage),
                limit: String(LIMIT),
            });
            if (categoryId) params.set('categoryId', categoryId);

            const r = await api.get(`/orders/admin/orders?${params.toString()}`);
            setOrders(r.data.orders);
            setTotal(r.data.total);
            setTotalPages(r.data.totalPages);
            setTotalRevenue(r.data.totalRevenue);
            setTotalOrders(r.data.totalOrders);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [categoryId, sortBy, sortDir, page]);

    // Re-fetch whenever filters / sort / page change
    useEffect(() => {
        if (user?.role === 'admin') fetchOrders();
    }, [categoryId, sortBy, sortDir, page, user]);

    const toggleSort = (field: 'createdAt' | 'total') => {
        if (sortBy === field) {
            setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(field);
            setSortDir('desc');
        }
        setPage(1);
    };

    const handleStatusChange = async (orderId: string, status: string) => {
        setUpdatingId(orderId);
        try {
            const response = await api.patch(`/orders/${orderId}/status`, { status });
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: response.data.status } : o));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortBy !== field) return <ArrowDown size={13} className="opacity-30" />;
        return sortDir === 'desc'
            ? <ArrowDown size={13} className="text-cta" />
            : <ArrowUp size={13} className="text-cta" />;
    };

    if (authLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-cta" size={36} /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-secondary-text mt-1">Filter by category, sort, and manage all customer orders.</p>
                </div>
                <button
                    onClick={() => fetchOrders(false)}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm text-secondary-text hover:text-foreground border border-primary/20 px-3 py-2 rounded-lg hover:bg-primary/5 transition"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-primary/10 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1.5"><ShoppingBag size={12} /> {categoryId ? 'Filtered Orders' : 'Total Orders'}</p>
                    <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                </div>
                <div className="bg-surface border border-primary/10 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1.5"><DollarSign size={12} /> {categoryId ? 'Filtered Revenue' : 'Total Revenue'}</p>
                    <p className="text-2xl font-bold text-foreground">{formatINR(totalRevenue)}</p>
                </div>
                <div className="bg-surface border border-primary/10 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
                    <p className="text-xs text-secondary-text uppercase tracking-wider mb-1 flex items-center gap-1.5"><Filter size={12} /> Category Filter</p>
                    <select
                        value={categoryId}
                        onChange={e => { setCategoryId(e.target.value); setPage(1); }}
                        className="w-full bg-background border border-primary/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cta/30 mt-1"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-xl border border-primary/10 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-secondary-text">
                        <thead className="bg-primary/5 text-foreground text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Items</th>
                                <th
                                    className="px-6 py-4 text-right cursor-pointer select-none hover:text-cta transition-colors"
                                    onClick={() => toggleSort('total')}
                                >
                                    <span className="inline-flex items-center gap-1 justify-end">Total <SortIcon field="total" /></span>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer select-none hover:text-cta transition-colors"
                                    onClick={() => toggleSort('createdAt')}
                                >
                                    <span className="flex items-center gap-1">Date <SortIcon field="createdAt" /></span>
                                </th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <Loader2 className="animate-spin text-cta mx-auto" size={28} />
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-secondary-text">
                                        No orders found{categoryId ? ' for this category' : ''}.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-foreground whitespace-nowrap">
                                            #{(order._id || '').slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-medium text-foreground">{order.user?.name || 'N/A'}</p>
                                            <p className="text-xs text-secondary-text">{order.user?.email || ''}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-foreground">
                                            {formatINR(order.total ?? 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {updatingId === order._id ? (
                                                <Loader2 size={16} className="animate-spin mx-auto text-cta" />
                                            ) : (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer capitalize focus:outline-none focus:ring-2 focus:ring-cta/30 ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}
                                                >
                                                    {STATUSES.map(s => (
                                                        <option key={s} value={s} className="bg-surface text-foreground capitalize">{s}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/account/orders/${order._id}`}
                                                target="_blank"
                                                title="View Order Detail"
                                                className="p-2 text-secondary-text hover:text-cta transition-colors inline-flex"
                                            >
                                                <ExternalLink size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-primary/10 bg-primary/5">
                        <p className="text-xs text-secondary-text">
                            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} orders
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-primary/20 hover:bg-primary/10 text-secondary-text disabled:opacity-40 transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-medium text-foreground">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg border border-primary/20 hover:bg-primary/10 text-secondary-text disabled:opacity-40 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
