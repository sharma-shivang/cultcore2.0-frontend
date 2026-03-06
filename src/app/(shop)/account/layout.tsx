'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { name: 'Profile', href: '/account/profile', icon: User },
        { name: 'My Orders', href: '/account/orders', icon: Package },
        // { name: 'Settings', href: '/account/settings', icon: Settings },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 space-y-2">
                    <div className="bg-surface rounded-2xl p-4 shadow-sm border border-primary/5">
                        <h2 className="text-xl font-bold px-3 mb-6">Settings</h2>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === item.href
                                            ? 'bg-cta text-white shadow-md'
                                            : 'text-secondary-text hover:bg-primary/5 hover:text-foreground'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </nav>
                    </div>
                </aside>
                <main className="flex-1 bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-primary/5 min-h-[600px]">
                    {children}
                </main>
            </div>
        </div>
    );
}
