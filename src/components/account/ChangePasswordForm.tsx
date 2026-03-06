'use client';

import { useState } from 'react';
import { api } from '@/lib/api/axios';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function ChangePasswordForm() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await api.post('/users/change-password', { oldPassword, newPassword });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text ml-1">
                        Current Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                        <input
                            type={showOld ? 'text' : 'password'}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-surface border border-primary/10 rounded-2xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-cta outline-none transition-all duration-300"
                            placeholder="Current password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowOld(!showOld)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-foreground"
                        >
                            {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-secondary-text ml-1">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                        <input
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-surface border border-primary/10 rounded-2xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-cta outline-none transition-all duration-300"
                            placeholder="New password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-foreground"
                        >
                            {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                            className="w-full bg-surface border border-primary/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-cta outline-none transition-all duration-300"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-foreground text-background px-8 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 active:scale-95"
            >
                {loading ? 'Changing...' : 'Update Password'}
            </button>
        </form>
    );
}
