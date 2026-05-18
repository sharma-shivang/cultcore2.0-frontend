'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, ShoppingBag, Settings, ChevronRight } from 'lucide-react';

export default function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    // Avatar Logic
    const getInitials = (name: string) => {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    const avatarContent = () => {
        if (user.picture) {
            return (
                <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover rounded-full"
                />
            );
        }
        if (user.name) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-cta/10 text-cta font-bold text-sm rounded-full">
                    {getInitials(user.name)}
                </div>
            );
        }
        // Default Placeholder
        return (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-secondary-text rounded-full">
                <User size={20} />
            </div>
        );
    };

    return (
        <div className="relative md:hidden" ref={menuRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 rounded-full border-2 border-primary/10 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 overflow-hidden bg-surface"
                aria-label="User menu"
            >
                {avatarContent()}
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 mt-3 w-64 bg-surface/95 backdrop-blur-md border border-primary/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform origin-top-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
            >
                {/* Header Info */}
                <div className="p-4 border-b border-primary/5 bg-primary/5">
                    <p className="text-sm font-bold truncate">{user.name || 'User'}</p>
                    <p className="text-[10px] text-secondary-text truncate uppercase tracking-wider">{user.email}</p>
                </div>

                {/* Links */}
                <div className="py-2">
                    <Link
                        href="/account/orders"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                                <ShoppingBag size={18} />
                            </div>
                            <span className="text-sm font-medium">My Orders</span>
                        </div>
                        <ChevronRight size={14} className="text-secondary-text/40" />
                    </Link>

                    <Link
                        href="/account/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                                <Settings size={18} />
                            </div>
                            <span className="text-sm font-medium">Profile</span>
                        </div>
                        <ChevronRight size={14} className="text-secondary-text/40" />
                    </Link>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            logout();
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-500/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg group-hover:scale-110 transition-transform">
                                <LogOut size={18} />
                            </div>
                            <span className="text-sm font-medium text-red-600">Logout</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
