'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/context/AuthContext';
import { Star, CheckCircle, Loader2, Trash2, MessageSquare } from 'lucide-react';

interface Review {
    _id: string;
    user: { name: string };
    rating: number;
    comment: string;
    verifiedPurchase: boolean;
    createdAt: string;
}

interface ReviewsData {
    reviews: Review[];
    total: number;
    averageRating: number;
    breakdown: { star: number; count: number }[];
}

// ── Star display ──────────────────────────────────────────────────────────────
function Stars({ value, size = 16, interactive = false, onChange }: {
    value: number;
    size?: number;
    interactive?: boolean;
    onChange?: (v: number) => void;
}) {
    const [hovered, setHovered] = useState(0);
    const display = hovered || value;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    size={size}
                    className={`transition-colors ${display >= star ? 'text-amber-400 fill-amber-400' : 'text-primary/20'} ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    onClick={() => interactive && onChange?.(star)}
                />
            ))}
        </div>
    );
}

// ── Rating bar (breakdown) ────────────────────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-secondary-text w-4">{star}</span>
            <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
            <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-secondary-text w-8 text-right">{count}</span>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductReviews({ productId }: { productId: string }) {
    const { user } = useAuth();
    const [data, setData] = useState<ReviewsData | null>(null);
    const [eligibility, setEligibility] = useState<{ canReview: boolean; verifiedPurchase: boolean; alreadyReviewed: boolean } | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const fetchReviews = useCallback(async () => {
        try {
            const r = await api.get(`/reviews/product/${productId}`);
            setData(r.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [productId]);

    const fetchEligibility = useCallback(async () => {
        if (!user) return;
        try {
            const r = await api.get(`/reviews/product/${productId}/eligibility`);
            setEligibility(r.data);
        } catch (e) { console.error(e); }
    }, [productId, user]);

    useEffect(() => {
        fetchReviews();
        fetchEligibility();
    }, [fetchReviews, fetchEligibility]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim().length < 10) { setFormError('Review must be at least 10 characters'); return; }
        setFormError('');
        setSubmitting(true);
        try {
            await api.post(`/reviews/product/${productId}`, { rating, comment });
            setFormSuccess(eligibility?.verifiedPurchase
                ? '✅ Review published!'
                : '⏳ Review submitted for moderation. It will appear once approved.');
            setComment('');
            setRating(5);
            await fetchReviews();
            await fetchEligibility();
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Delete this review?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            await fetchReviews();
            await fetchEligibility();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete review');
        }
    };

    return (
        <section className="mt-16 pt-10 border-t border-primary/10">
            <h2 className="text-2xl font-bold tracking-tight mb-8 flex items-center gap-2">
                <MessageSquare size={22} className="text-cta" /> Customer Reviews
            </h2>

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cta" size={28} /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: summary + form */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm text-center">
                            <p className="text-6xl font-black text-foreground">{data?.averageRating ?? 0}</p>
                            <Stars value={Math.round(data?.averageRating ?? 0)} size={20} />
                            <p className="text-sm text-secondary-text mt-1">{data?.total ?? 0} review{(data?.total ?? 0) !== 1 ? 's' : ''}</p>
                            <div className="mt-4 space-y-1.5">
                                {(data?.breakdown ?? []).map(b => (
                                    <RatingBar key={b.star} star={b.star} count={b.count} total={data?.total ?? 0} />
                                ))}
                            </div>
                        </div>

                        {/* Review form */}
                        {user ? (
                            eligibility?.alreadyReviewed ? (
                                <div className="bg-surface border border-primary/10 rounded-2xl p-5 text-center text-sm text-secondary-text">
                                    <CheckCircle size={20} className="text-green-500 mx-auto mb-2" />
                                    You've already reviewed this product.
                                </div>
                            ) : (
                                <div className="bg-surface border border-primary/10 rounded-2xl p-6 shadow-sm">
                                    <h3 className="font-bold mb-4">
                                        {eligibility?.verifiedPurchase ? 'Write a Review' : 'Share Your Thoughts'}
                                    </h3>
                                    {!eligibility?.verifiedPurchase && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2 mb-4">
                                            Only verified buyers get instant approval. Your review will be pending moderation.
                                        </p>
                                    )}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Your Rating</label>
                                            <Stars value={rating} size={28} interactive onChange={setRating} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Your Review</label>
                                            <textarea
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                                placeholder="Share what you think about this product (min. 10 characters)..."
                                                rows={4}
                                                className="w-full bg-background border border-primary/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cta/30 resize-none"
                                            />
                                        </div>
                                        {formError && <p className="text-sm text-red-500">{formError}</p>}
                                        {formSuccess && <p className="text-sm text-green-600 dark:text-green-400">{formSuccess}</p>}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-cta text-surface hover:bg-cta-hover py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {submitting && <Loader2 size={14} className="animate-spin" />}
                                            Submit Review
                                        </button>
                                    </form>
                                </div>
                            )
                        ) : (
                            <div className="bg-surface border border-primary/10 rounded-2xl p-5 text-center text-sm text-secondary-text">
                                <a href="/login" className="text-cta hover:underline font-medium">Sign in</a> to write a review.
                            </div>
                        )}
                    </div>

                    {/* Right: reviews list */}
                    <div className="lg:col-span-2 space-y-4">
                        {(data?.reviews ?? []).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-secondary-text text-center">
                                <Star size={40} className="mb-3 opacity-20" />
                                <p className="font-medium">No reviews yet.</p>
                                <p className="text-sm">Be the first to share your experience!</p>
                            </div>
                        ) : (
                            (data?.reviews ?? []).map(review => (
                                <div key={review._id} className="bg-surface border border-primary/10 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <p className="font-semibold text-foreground text-sm">{review.user?.name ?? 'Anonymous'}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Stars value={review.rating} size={13} />
                                                {review.verifiedPurchase && (
                                                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                                        <CheckCircle size={11} /> Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-secondary-text">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {user && (user as any).id === (review.user as any)?._id && (
                                                <button
                                                    onClick={() => handleDelete(review._id)}
                                                    className="p-1 text-secondary-text hover:text-red-500 transition-colors"
                                                    title="Delete review"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-secondary-text leading-relaxed">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
