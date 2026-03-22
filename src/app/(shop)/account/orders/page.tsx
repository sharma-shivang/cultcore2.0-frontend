'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, ShoppingBag, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import ConfirmModal from '@/components/ui/ConfirmModal';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

    const fetchOrders = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const r = await api.get('/orders');
            setOrders(r.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const openCancelModal = (e: React.MouseEvent, orderId: string) => {
        e.preventDefault();
        setPendingCancelId(orderId);
        setError('');
        setModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!pendingCancelId) return;
        setCancelling(true);
        try {
            await api.patch(`/orders/${pendingCancelId}/cancel`);
            setModalOpen(false);
            setPendingCancelId(null);
            await fetchOrders(false);
        } catch (err: any) {
            setModalOpen(false);
            setError(err.response?.data?.message || 'Failed to cancel order. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const handleCloseModal = () => {
        if (cancelling) return;
        setModalOpen(false);
        setPendingCancelId(null);
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchOrders(false);
        }
    }, [user, authLoading, router, fetchOrders]);

    if (loading || authLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-cta" size={36} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                <button
                    onClick={() => fetchOrders(true)}
                    disabled={refreshing}
                    title="Refresh orders"
                    className="flex items-center gap-2 text-sm text-secondary-text hover:text-foreground border border-primary/20 px-3 py-2 rounded-lg hover:bg-primary/5 transition"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>
            <p className="text-secondary-text mb-6">Track and manage all your purchases.</p>

            {/* Inline error banner */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 transition">✕</button>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                    <div className="bg-primary/5 p-6 rounded-full mb-6 text-cta">
                        <ShoppingBag size={48} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                    <p className="text-secondary-text mb-6">You haven't placed any orders. Start shopping to see them here.</p>
                    <Link href="/products" className="bg-cta text-surface hover:bg-cta-hover px-8 py-3 rounded-xl font-medium transition">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order._id}
                            href={`/account/orders/${order._id}`}
                            className="block bg-surface border border-primary/10 rounded-2xl p-6 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/5 p-3 rounded-xl text-cta shrink-0">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground text-sm font-mono">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-sm text-secondary-text mt-0.5">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {order.items.slice(0, 3).map((item: any) => (
                                                <span key={item._id} className="text-xs bg-primary/5 px-2 py-1 rounded-lg text-secondary-text">
                                                    {item.product?.title || 'Product'} ×{item.quantity}
                                                </span>
                                            ))}
                                            {order.items.length > 3 && (
                                                <span className="text-xs bg-primary/5 px-2 py-1 rounded-lg text-secondary-text">
                                                    +{order.items.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 shrink-0">
                                    <p className="text-xl font-bold text-foreground">{formatINR(order.total)}</p>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                                        {order.status}
                                    </span>
                                    {['pending', 'confirmed'].includes(order.status) && (
                                        <button
                                            onClick={(e) => openCancelModal(e, order._id)}
                                            className="text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-1 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-end mt-4 text-sm text-secondary-text group-hover:text-cta transition-colors">
                                View details <ChevronRight size={16} className="ml-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmCancel}
                isLoading={cancelling}
                title="Cancel this order?"
                description="Are you sure you want to cancel this order? Stock will be restored, but this action cannot be undone."
                confirmLabel="Yes, Cancel Order"
                cancelLabel="No, Keep Order"
            />
        </div>
    );
}
