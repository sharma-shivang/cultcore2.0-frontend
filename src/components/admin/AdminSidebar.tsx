'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, LayoutDashboard, Settings, LogOut, Home, ShoppingCart, Tag, MessageSquare, Ticket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Tag },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
        { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-surface border-r border-primary/10 min-h-screen flex flex-col shrink-0 sticky top-0 h-screen">
            <div className="h-14 flex items-center px-6 border-b border-primary/10 text-xl font-bold text-foreground">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    Elevate<span className="text-cta">Admin</span>
                </Link>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = item.path === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                ? 'bg-cta text-surface shadow-sm'
                                : 'text-secondary-text hover:bg-primary/5 hover:text-foreground'
                                }`}
                        >
                            <Icon size={20} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-primary/10 space-y-2">
                <Link
                    href="/"
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium text-secondary-text hover:bg-primary/5 hover:text-foreground transition-colors"
                >
                    <Home size={20} />
                    Back to Store
                </Link>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
