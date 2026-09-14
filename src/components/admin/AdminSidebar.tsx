'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, LayoutDashboard, Settings, LogOut, Home, ShoppingCart, Tag, MessageSquare, Ticket, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Tag },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
        { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const toggleMobile = () => setMobileOpen(!mobileOpen);
    const closeMobile = () => setMobileOpen(false);

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-primary/10 sticky top-0 z-40">
                <Link href="/admin" className="text-lg font-bold text-foreground flex items-center gap-1">
                    Elevate<span className="text-cta">Admin</span>
                </Link>
                <button
                    onClick={toggleMobile}
                    className="p-2 text-secondary-text hover:text-foreground rounded-lg border border-primary/10 transition"
                    aria-label="Toggle Navigation"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={closeMobile}
                />
            )}

            {/* Sidebar Content (Desktop Sticky + Mobile Drawer) */}
            <aside className={`
                fixed md:sticky top-0 z-50 md:z-0 left-0 h-screen w-64 bg-surface border-r border-primary/10 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-14 flex items-center justify-between px-6 border-b border-primary/10 text-xl font-bold text-foreground">
                    <Link href="/" onClick={closeMobile} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        Elevate<span className="text-cta">Admin</span>
                    </Link>
                    <button onClick={closeMobile} className="md:hidden text-secondary-text hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = item.path === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={closeMobile}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                                    ? 'bg-cta text-surface shadow-sm font-semibold'
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
                        onClick={closeMobile}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium text-secondary-text hover:bg-primary/5 hover:text-foreground transition-colors"
                    >
                        <Home size={20} />
                        Back to Store
                    </Link>
                    <button
                        onClick={() => { closeMobile(); logout(); }}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
