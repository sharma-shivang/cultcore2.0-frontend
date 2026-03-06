'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api/axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, LogIn, Github, ArrowRight } from 'lucide-react';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            login(accessToken, refreshToken, redirectTo);
        }
    }, [searchParams, login, redirectTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.accessToken, response.data.refreshToken, redirectTo);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
        window.location.href = `${backendUrl}/api/auth/google`;
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-display mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-lg text-secondary-text">
                        Sign in to your ElevateX account
                    </p>
                </div>

                <div className="mt-10 bg-white dark:bg-card-bg/50 backdrop-blur-xl border border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-secondary-text group-focus-within:text-cta transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-primary/5 border border-primary/10 rounded-2xl text-foreground focus:ring-2 focus:ring-cta/50 focus:border-cta focus:bg-white outline-none transition-all duration-300 sm:text-sm"
                                        placeholder="alex@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" title="Forgot Password" className="text-sm font-bold text-cta hover:text-cta/80 transition-colors">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-secondary-text group-focus-within:text-cta transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-primary/5 border border-primary/10 rounded-2xl text-foreground focus:ring-2 focus:ring-cta/50 focus:border-cta focus:bg-white outline-none transition-all duration-300 sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-shake">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 px-4 bg-cta text-white font-bold rounded-2xl shadow-lg shadow-cta/20 hover:shadow-xl hover:shadow-cta/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-primary/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm uppercase tracking-widest">
                                <span className="px-4 bg-white dark:bg-card-bg text-secondary-text font-bold">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-4">
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full inline-flex justify-center items-center py-4 px-4 bg-white border border-primary/10 rounded-2xl shadow-sm text-sm font-bold text-foreground hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
                            >
                                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span>Sign in with Google</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-secondary-text font-medium">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-cta font-bold hover:text-cta/80 transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center animate-pulse">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}

