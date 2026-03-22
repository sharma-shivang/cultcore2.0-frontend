'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, MapPin, Loader2, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import ConfirmModal from '@/components/ui/ConfirmModal';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [cancelError, setCancelError] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fetchOrder = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const r = await api.get(`/orders/${params.id}`);
            setOrder(r.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Order not found');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [params.id]);

    const handleConfirmCancel = async () => {
        setCancelling(true);
        try {
            await api.patch(`/orders/${params.id}/cancel`);
            setModalOpen(false);
            await fetchOrder(false);
        } catch (err: any) {
            setModalOpen(false);
            setCancelError(err.response?.data?.message || 'Failed to cancel order. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchOrder(false);
            // Poll every 10 seconds for status updates
            const interval = setInterval(() => fetchOrder(false), 10000);
            return () => clearInterval(interval);
        }
    }, [user, authLoading, params.id, router, fetchOrder]);

    if (loading || authLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-cta" size={36} />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-xl">
                <p className="text-xl font-semibold text-foreground mb-4">{error || 'Order not found'}</p>
                <Link href="/account/orders" className="text-cta hover:underline">← Back to orders</Link>
            </div>
        );
    }

    const currentStep = STATUS_STEPS.indexOf(order.status);
    const canCancel = ['pending', 'confirmed'].includes(order.status);

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-secondary-text hover:text-foreground transition mb-6">
                <ArrowLeft size={16} /> Back to Orders
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
                    <p className="text-secondary-text font-mono text-sm mt-1">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {canCancel && (
                        <button
                            onClick={() => { setCancelError(''); setModalOpen(true); }}
                            disabled={refreshing}
                            className="text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-4 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                        >
                            Cancel Order
                        </button>
                    )}
                    <span className={`text-sm font-semibold px-4 py-1.5 rounded-full capitalize ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                        {order.status}
                    </span>
                    <button
                        onClick={() => fetchOrder(true)}
                        disabled={refreshing}
                        title="Refresh status"
                        className="p-2 rounded-full hover:bg-primary/10 text-secondary-text hover:text-foreground transition-colors"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Inline cancellation error */}
            {cancelError && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{cancelError}</span>
                    <button onClick={() => setCancelError('')} className="ml-auto text-red-400 hover:text-red-600 transition">✕</button>
                </div>
            )}

            {/* Progress Tracker (only for non-cancelled) */}
            {order.status !== 'cancelled' && (
                <div className="bg-surface border border-primary/10 rounded-2xl p-6 mb-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-secondary-text uppercase tracking-wider mb-5">Order Progress</h2>
                    <div className="flex items-center gap-0">
                        {STATUS_STEPS.map((step, idx) => (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                                <div className={`flex flex-col items-center gap-1.5 shrink-0`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${idx <= currentStep ? 'bg-cta border-cta text-surface' : 'border-primary/20 text-secondary-text bg-background'}`}>
                                        {idx <= currentStep ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                    </div>
                                    <span className="text-xs text-secondary-text capitalize hidden sm:block">{step}</span>
                                </div>
                                {idx < STATUS_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 ${idx < currentStep ? 'bg-cta' : 'bg-primary/10'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Items */}
                <div className="md:col-span-2 bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Package size={18} className="text-cta" /> Items Ordered</h2>
                    <div className="space-y-4">
                        {order.items.map((item: any) => {
                            const product = item.product;
                            return (
                                <div key={item._id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-primary/5 overflow-hidden shrink-0">
                                        <img
                                            src={product?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200'}
                                            alt={product?.title || 'Product'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">{product?.title || 'Product unavailable'}</p>
                                        <p className="text-sm text-secondary-text">Qty: {item.quantity} × {formatINR(item.price)}</p>
                                    </div>
                                    <p className="font-semibold text-foreground shrink-0">{formatINR(item.price * item.quantity)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary & Address */}
                <div className="space-y-4">
                    <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm">
                        <h2 className="font-bold mb-4">Order Summary</h2>
                        <div className="space-y-2 text-sm text-secondary-text">
                            <div className="flex justify-between"><span>Subtotal</span><span className="text-foreground">{formatINR(order.subtotal)}</span></div>
                            <div className="flex justify-between"><span>Shipping</span><span className="text-foreground">{order.shipping === 0 ? <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span> : formatINR(order.shipping)}</span></div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                    <span className="font-semibold">−{formatINR(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold pt-2 border-t border-primary/10 text-foreground text-base">
                                <span>Total</span><span>{formatINR(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm">
                        <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin size={16} className="text-cta" /> Shipping Address</h2>
                        <div className="text-sm text-secondary-text space-y-0.5">
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>

                    <div className="text-xs text-secondary-text px-1">
                        Placed on {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={modalOpen}
                onClose={() => { if (!cancelling) setModalOpen(false); }}
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
