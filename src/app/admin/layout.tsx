'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in -> redirect to login with callback URL
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            } else if (user.role !== 'admin') {
                // Logged in but not admin -> redirect to home
                router.push('/');
            } else {
                // Authorized
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router, pathname]);

    if (loading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta"></div>
            </div>
        );
    }

    // Wrap the admin interface. Note we don't render the global Navbar/Footer here.
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <main className="flex-1 overflow-x-hidden p-8">
                {children}
            </main>
        </div>
    );
}
