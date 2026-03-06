'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api/axios';
import { User, Mail, Shield, CheckCircle } from 'lucide-react';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('/users/update-profile', { name, email });
            setUser({ ...user!, name, email });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold mb-8 text-foreground tracking-tight">Your Profile</h1>

            <section className="mb-12">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text ml-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-primary/5 border border-primary/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-cta outline-none transition-all duration-300"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text ml-1">
                                Email Address
                            </label>
                            <div className="relative opacity-70">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                                <input
                                    type="email"
                                    value={email}
                                    className="w-full bg-primary/5 border border-primary/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-cta outline-none transition-all duration-300 cursor-not-allowed"
                                    placeholder="Email address"
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text ml-1">
                                Role
                            </label>
                            <div className="relative opacity-70">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                                <input
                                    type="text"
                                    value={user?.role?.toUpperCase() || ''}
                                    className="w-full bg-primary/5 border border-primary/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-cta outline-none transition-all duration-300 cursor-not-allowed"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            <span className="font-medium text-sm">{message.text}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-cta text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-cta/20 hover:shadow-xl hover:shadow-cta/30 transition-all duration-300 disabled:opacity-50 active:scale-95"
                    >
                        {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>
            </section>

            <hr className="border-primary/5 mb-12" />

            <section>
                <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Security</h2>
                <ChangePasswordForm />
            </section>
        </div>
    );
}
