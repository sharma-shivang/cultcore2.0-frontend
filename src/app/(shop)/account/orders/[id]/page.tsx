'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, MapPin, Loader2, CheckCircle, RefreshCw, AlertCircle, User, Mail, Phone, AtSign } from 'lucide-react';
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Main Content Area (Items + Customer & Address) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items Ordered Card */}
                    <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Package size={20} className="text-cta" /> Items Ordered ({order.items.length})
                        </h2>
                        <div className="space-y-4 divide-y divide-primary/5">
                            {order.items.map((item: any, idx: number) => {
                                const product = item.product;
                                return (
                                    <div key={item._id || idx} className="flex items-center gap-4 pt-4 first:pt-0">
                                        <div className="w-16 h-16 rounded-xl bg-primary/5 overflow-hidden shrink-0 border border-primary/10">
                                            <img
                                                src={product?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200'}
                                                alt={product?.title || 'Product'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground text-sm sm:text-base truncate">{product?.title || 'Product unavailable'}</p>
                                            <div className="flex flex-wrap items-center gap-x-3 text-xs text-secondary-text mt-1">
                                                <span>Qty: {item.quantity} × {formatINR(item.price)}</span>
                                                {item.size && <span>Size: <strong className="text-foreground font-medium">{item.size}</strong></span>}
                                                {item.color && <span>Color: <strong className="text-foreground font-medium">{item.color}</strong></span>}
                                            </div>
                                        </div>
                                        <p className="font-bold text-foreground shrink-0 text-sm sm:text-base">{formatINR(item.price * item.quantity)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Customer & Address Details Card (Spacious 2-column layout) */}
                    <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Customer Details Box */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-base flex items-center gap-2 text-foreground pb-2 border-b border-primary/10">
                                    <User size={18} className="text-cta" /> Customer Details
                                </h3>
                                <div>
                                    <p className="text-xs text-secondary-text">Full Name</p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">
                                        {[order.firstName, order.lastName].filter(Boolean).join(' ').trim() || order.user?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-secondary-text">Email Address</p>
                                    <p className="text-sm font-medium text-foreground mt-0.5 break-all">
                                        {order.email || order.user?.email || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-secondary-text">Phone Number</p>
                                    <p className="text-sm font-medium text-foreground mt-0.5">
                                        {order.phone || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-secondary-text">Instagram Handle</p>
                                    {order.instagram ? (
                                        <div className="mt-1">
                                            <span className="inline-flex items-center gap-1.5 bg-pink-500/10 text-pink-600 dark:text-pink-400 px-3 py-1 rounded-xl font-mono font-semibold text-xs border border-pink-500/20">
                                                <AtSign size={13} />
                                                {order.instagram.replace(/^@/, '')}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-secondary-text/60 mt-0.5">N/A</p>
                                    )}
                                </div>
                            </div>

                            {/* Full Shipping Address Box */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-base flex items-center gap-2 text-foreground pb-2 border-b border-primary/10">
                                    <MapPin size={18} className="text-cta" /> Shipping Address
                                </h3>
                                <div>
                                    <p className="text-xs text-secondary-text">Street Address</p>
                                    <p className="text-sm font-medium text-foreground mt-0.5 leading-snug">
                                        {order.shippingAddress?.street || 'N/A'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-xs text-secondary-text">City / State</p>
                                        <p className="text-sm font-medium text-foreground mt-0.5">
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-secondary-text">ZIP / PIN Code</p>
                                        <p className="text-sm font-medium text-foreground mt-0.5 font-mono">
                                            {order.shippingAddress?.zipCode}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-secondary-text">Country</p>
                                    <p className="text-sm font-medium text-foreground mt-0.5">
                                        {order.shippingAddress?.country}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Note Banner if present */}
                        {order.orderNote && (
                            <div className="pt-4 border-t border-primary/10">
                                <p className="text-xs font-semibold text-foreground mb-1">Customer Order Note:</p>
                                <p className="text-xs text-secondary-text bg-primary/5 border border-primary/10 p-3 rounded-xl italic leading-relaxed">
                                    "{order.orderNote}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column (Order Summary) */}
                <div className="space-y-6 lg:sticky lg:top-24">
                    <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm space-y-4">
                        <h2 className="font-bold text-lg pb-3 border-b border-primary/10">Order Summary</h2>
                        <div className="space-y-3 text-sm text-secondary-text">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-foreground">{formatINR(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="font-medium text-foreground">
                                    {order.shipping === 0 ? <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span> : formatINR(order.shipping)}
                                </span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                    <span className="font-semibold">−{formatINR(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-3 border-t border-primary/10 text-foreground">
                                <span>Total Amount</span>
                                <span className="text-cta">{formatINR(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-primary/10 rounded-2xl p-4 shadow-sm text-xs text-secondary-text space-y-1">
                        <p className="font-medium text-foreground">Order Date & Time</p>
                        <p>{new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
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
