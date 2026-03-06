'use client';

import { useState, Suspense } from 'react';
import { api } from '@/lib/api/axios';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setMessage({ type: 'error', text: 'Invalid or missing reset token' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setMessage({ type: 'success', text: 'Password reset successfully!' });
            setTimeout(() => router.push('/login'), 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reset password' });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center p-8 bg-red-50 rounded-3xl border border-red-100">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-700 mb-2">Invalid Reset Link</h2>
                <p className="text-red-600 mb-6">This link is invalid or has expired. Please request a new one.</p>
                <Link href="/forgot-password" title="Forgot Password" className="text-cta font-bold hover:underline">
                    Request new link
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text ml-1">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-primary/5 border border-primary/10 rounded-2xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-cta outline-none transition-all duration-300"
                            placeholder="At least 6 characters"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text ml-1">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-primary/5 border border-primary/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-cta outline-none transition-all duration-300"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span className="font-medium text-sm leading-tight">{message.text}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-cta text-white py-4 rounded-2xl font-bold font-display shadow-lg shadow-cta/20 hover:shadow-xl hover:shadow-cta/30 transition-all duration-300 disabled:opacity-50 active:scale-95"
            >
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-6 text-cta">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Create New Password</h1>
                    <p className="text-secondary-text">Set a strong password to protect your account.</p>
                </div>

                <div className="bg-surface rounded-3xl p-8 shadow-xl shadow-primary/5 border border-primary/5">
                    <Suspense fallback={<div className="text-center py-20 animate-pulse text-secondary-text">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
