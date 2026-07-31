'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, CheckCircle, Loader2, MapPin, Package, Tag, X } from 'lucide-react';
import { formatINR } from '@/lib/currency';

interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

// Shipping configuration: 120 below cart value 1500, else 150
const SHIPPING_LOW_THRESHOLD_CHARGE = 120;
const SHIPPING_HIGH_THRESHOLD_CHARGE = 150;
const SHIPPING_THRESHOLD = 1500;

export default function CheckoutPage() {
    const { items, subtotal, loading: cartLoading, fetchCart } = useCart();
    const router = useRouter();

    const [address, setAddress] = useState<ShippingAddress>({
        street: '', city: '', state: '', zipCode: '', country: '',
    });
    const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '', orderNote: '' });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');

    // Coupon state
    const [couponInput, setCouponInput] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discountAmount: number;
        message: string;
    } | null>(null);
    const [couponError, setCouponError] = useState('');

    const tax = 0;
    const shipping = subtotal < SHIPPING_THRESHOLD ? SHIPPING_LOW_THRESHOLD_CHARGE : SHIPPING_HIGH_THRESHOLD_CHARGE;
    const discount = appliedCoupon?.discountAmount ?? 0;
    const total = Math.max(0, subtotal - discount + shipping);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContact({ ...contact, [e.target.name]: e.target.value });
    };

    const isFormValid =
        Object.values(address).every((v) => v.trim().length > 0) &&
        contact.firstName.trim().length > 0 &&
        contact.lastName.trim().length > 0 &&
        contact.email.trim().length > 0 &&
        contact.phone.trim().length > 0;

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const r = await api.post('/coupons/validate', {
                code: couponInput.trim().toUpperCase(),
                orderSubtotal: subtotal,
            });
            if (r.data.valid) {
                setAppliedCoupon({
                    code: couponInput.trim().toUpperCase(),
                    discountAmount: r.data.discountAmount,
                    message: r.data.message,
                });
                setCouponInput('');
            } else {
                setCouponError(r.data.message || 'Invalid coupon');
            }
        } catch (err: any) {
            setCouponError(err.response?.data?.message || 'Failed to validate coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponInput('');
        setCouponError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        setSubmitting(true);
        setError('');
        try {
            const response = await api.post('/orders/checkout', {
                shippingAddress: address,
                email: contact.email,
                phone: contact.phone,
                firstName: contact.firstName,
                lastName: contact.lastName,
                orderNote: contact.orderNote || undefined,
                ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
            });
            const createdOrderId = response.data._id;
            setOrderId(createdOrderId);
            setSuccess(true);
            await fetchCart();

            // Resolve absolute image URL
            const getAbsoluteImageUrl = (url?: string) => {
                if (!url) return '';
                if (url.startsWith('http://') || url.startsWith('https://')) return url;
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || window.location.origin;
                return `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
            };

            // Construct WhatsApp message with formatted order details
            const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+919876543210';
            const itemsText = items
                .map((item, index) => {
                    const product = item.product as any;
                    return `${index + 1}. ${product?.title || 'Product'} x ${item.quantity} (${formatINR((product?.price || 0) * item.quantity)})`;
                })
                .join('\n');

            const imagesList = items
                .map((item) => {
                    const product = item.product as any;
                    return getAbsoluteImageUrl(product?.images?.[0]);
                })
                .filter((url) => !!url)
                .join('\n');

            const message = `*New Order Confirmed!*\n\n` +
                `*Order Details:*\n` +
                `• *Name:* ${contact.firstName} ${contact.lastName}\n` +
                `• *Email:* ${contact.email}\n` +
                `• *Phone:* ${contact.phone}\n\n` +
                `*Shipping Address:*\n` +
                `${address.street}, ${address.city}, ${address.state} - ${address.zipCode}, ${address.country}\n\n` +
                `*Items:*\n${itemsText}\n\n` +
                `*Payment Summary:*\n` +
                `• *Subtotal:* ${formatINR(subtotal)}\n` +
                `• *Discount:* ${discount > 0 ? `-${formatINR(discount)}` : 'N/A'}\n` +
                `• *Shipping:* ${formatINR(shipping)}\n` +
                `• *Total:* ${formatINR(total)}\n` +
                (contact.orderNote ? `\n*Order Note:* ${contact.orderNote}\n` : '') +
                `\n*Kindly share the QR CODE for payment so I can confirm my order*` +
                (imagesList ? `\n\n${imagesList}` : '');

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9+]/g, '')}?text=${encodedMessage}`;

            // Redirect the user to WhatsApp
            window.location.href = whatsappUrl;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (cartLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-cta" size={40} />
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6 text-green-600 dark:text-green-400">
                    <CheckCircle size={56} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Order Placed!</h1>
                <p className="text-secondary-text mb-2 max-w-md">
                    Thank you for your purchase. Your order has been confirmed and is now being processed.
                </p>
                {appliedCoupon && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                        🎉 Coupon <span className="font-mono">{appliedCoupon.code}</span> saved you {formatINR(appliedCoupon.discountAmount)}!
                    </p>
                )}
                <p className="text-xs text-secondary-text font-mono mb-8 bg-primary/5 px-4 py-2 rounded-lg">
                    Order ID: {orderId}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/products"
                        className="bg-cta text-surface hover:bg-cta-hover px-8 py-3 rounded-xl font-medium transition inline-flex items-center gap-2"
                    >
                        <ShoppingBag size={18} /> Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    if (!cartLoading && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="bg-primary/5 p-6 rounded-full mb-6 text-cta">
                    <ShoppingBag size={48} />
                </div>
                <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
                <p className="text-secondary-text mb-8">Add items before checking out.</p>
                <Link href="/products" className="bg-cta text-surface hover:bg-cta-hover px-8 py-3 rounded-xl font-medium transition">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
            {/* Header */}
            <div className="mb-10">
                <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-secondary-text hover:text-foreground transition mb-4">
                    <ArrowLeft size={16} /> Back to Cart
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Checkout</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left: Shipping + Items */}
                    <div className="flex-1 space-y-6">
                        {/* Shipping Form */}
                        <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                                <MapPin size={20} className="text-cta" /> Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Street Address</label>
                                    <input name="street" value={address.street} onChange={handleChange} required placeholder="12, MG Road, Connaught Place" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                                        <input name="city" value={address.city} onChange={handleChange} required placeholder="New Delhi" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">State / Province</label>
                                        <input name="state" value={address.state} onChange={handleChange} required placeholder="Delhi" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">ZIP / PIN Code</label>
                                        <input name="zipCode" value={address.zipCode} onChange={handleChange} required placeholder="110001" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                                        <input name="country" value={address.country} onChange={handleChange} required placeholder="India" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                                <span className="text-cta">✉</span> Contact Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
                                    <input name="firstName" value={contact.firstName} onChange={handleContactChange} required placeholder="John" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Last Name *</label>
                                    <input name="lastName" value={contact.lastName} onChange={handleContactChange} required placeholder="Doe" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                                    <input name="email" type="email" value={contact.email} onChange={handleContactChange} required placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone *</label>
                                    <input name="phone" type="tel" value={contact.phone} onChange={handleContactChange} required placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                                <Package size={20} className="text-cta" /> Items ({items.length})
                            </h2>
                            <div className="space-y-4">
                                {items.map((item) => {
                                    const product = item.product as any;
                                    if (!product) return null;
                                    return (
                                        <div key={product._id} className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-primary/5 overflow-hidden shrink-0">
                                                <img
                                                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200'}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground truncate">{product.title}</p>
                                                <p className="text-sm text-secondary-text">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-foreground shrink-0">
                                                {formatINR(product.price * item.quantity)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Note */}
                        <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                                <span className="text-cta"></span> Order Note
                                <span className="text-xs font-normal text-secondary-text ml-1">(optional)</span>
                            </h2>
                            <textarea
                                name="orderNote"
                                value={contact.orderNote}
                                onChange={handleContactChange}
                                rows={3}
                                placeholder="Any special instructions, Any 3 items you do not want in your scoop.."
                                className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-background text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-cta/50 transition resize-none"
                            />
                        </div>

                    </div>

                    {/* Right: Order Summary */}
                    <div className="w-full lg:w-96 shrink-0">
                        <div className="bg-surface border border-primary/10 rounded-2xl p-6 lg:p-8 sticky top-24 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold">Order Summary</h2>

                            {/* Coupon input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    <Tag size={14} className="text-cta" /> Coupon Code
                                </label>
                                {appliedCoupon ? (
                                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5">
                                        <CheckCircle size={15} className="text-green-600 dark:text-green-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold font-mono text-green-700 dark:text-green-400">{appliedCoupon.code}</p>
                                            <p className="text-xs text-green-600 dark:text-green-500">{appliedCoupon.message}</p>
                                        </div>
                                        <button type="button" onClick={handleRemoveCoupon} className="text-secondary-text hover:text-red-500 transition shrink-0">
                                            <X size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                                            placeholder="ENTER CODE"
                                            className="flex-1 px-3 py-2 rounded-xl border border-primary/20 bg-background text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-cta/50 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponInput.trim()}
                                            className="px-4 py-2 rounded-xl bg-cta text-surface text-sm font-medium hover:bg-cta-hover transition disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                                        >
                                            {couponLoading ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                                        </button>
                                    </div>
                                )}
                                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                            </div>

                            {/* Price breakdown */}
                            <div className="space-y-3 text-sm text-secondary-text">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-foreground">{formatINR(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>Discount ({appliedCoupon?.code})</span>
                                        <span className="font-semibold">−{formatINR(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-medium text-foreground">{formatINR(shipping)}</span>
                                </div>

                            </div>

                            <div className="border-t border-primary/10 pt-4">
                                <div className="flex justify-between items-end">
                                    <span className="font-semibold text-foreground">Total</span>
                                    <span className="text-2xl font-bold text-foreground">{formatINR(total)}</span>
                                </div>
                                {discount > 0 && (
                                    <p className="text-xs text-green-600 dark:text-green-400 text-right mt-1">
                                        You save {formatINR(discount)}!
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || !isFormValid}
                                className="w-full bg-cta text-surface hover:bg-cta-hover py-4 rounded-xl font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                ) : (
                                    <><CheckCircle size={18} /> Confirm Order</>
                                )}
                            </button>

                            <p className="text-xs text-secondary-text text-center">
                                By placing your order, you agree to our terms and conditions.
                            </p>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}
