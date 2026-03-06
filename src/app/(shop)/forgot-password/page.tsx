'use client';

import { useState } from 'react';
import { api } from '@/lib/api/axios';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage({ type: 'success', text: response.data.message });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 mb-6">
                        <Mail className="w-8 h-8 text-cta" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Forgot Password?</h1>
                    <p className="text-secondary-text">No worries! Enter your email and we'll send you a reset link.</p>
                </div>

                <div className="bg-surface rounded-3xl p-8 shadow-xl shadow-primary/5 border border-primary/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-primary/5 border border-primary/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-cta outline-none transition-all duration-300"
                                    placeholder="your@email.com"
                                    required
                                />
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
                            {loading ? 'Sending link...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <Link href="/login" className="inline-flex items-center gap-2 text-secondary-text hover:text-cta font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
