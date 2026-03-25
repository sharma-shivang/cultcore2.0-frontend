'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api/axios';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/register', { name, email, password });
            // Register usually returns tokens directly too, or redirects to login. 
            // We designed backend to return tokens.
            login(response.data.accessToken, response.data.refreshToken);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-surface">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-surface p-10 shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Create an Account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="relative block w-full appearance-none rounded-md border border-primary/20 bg-white/5 px-3 py-2 text-foreground placeholder:text-secondary-text focus:z-10 focus:border-cta focus:outline-none focus:ring-cta sm:text-sm"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full appearance-none rounded-md border border-primary/20 bg-white/5 px-3 py-2 text-foreground placeholder:text-secondary-text focus:z-10 focus:border-cta focus:outline-none focus:ring-cta sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full appearance-none rounded-md border border-primary/20 bg-white/5 px-3 py-2 text-foreground placeholder:text-secondary-text focus:z-10 focus:border-cta focus:outline-none focus:ring-cta sm:text-sm"
                                placeholder="Password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-cta px-4 py-2 text-sm font-medium text-white hover:bg-cta focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        >
                            Sign up
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-cta hover:text-cta">
                            Log in here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
