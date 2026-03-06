'use client';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api/axios';
import { useEffect, useState } from 'react';

export default function DashboardClient() {
    const { user, logout } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [adminData, setAdminData] = useState<any>(null);

    useEffect(() => {
        api.get('/users/profile').then((res: any) => setProfileData(res.data)).catch(console.error);
        if (user?.role === 'admin') {
            api.get('/users/admin-stats').then((res: any) => setAdminData(res.data)).catch(console.error);
        }
    }, [user]);

    return (
        <div className="container mx-auto p-12">
            <div className="bg-surface rounded-lg shadow p-8">
                <h1 className="text-3xl font-bold mb-6">Welcome back, {user?.role.toUpperCase()}</h1>
                <p>Email: {user?.email}</p>

                <div className="mt-8 border-t pt-4">
                    <h2 className="text-xl font-semibold mb-2">Backend Profile Check</h2>
                    <pre className="bg-surface p-4 rounded text-sm">{JSON.stringify(profileData, null, 2)}</pre>
                </div>

                {user?.role === 'admin' && (
                    <div className="mt-8 border-t pt-4">
                        <h2 className="text-xl font-semibold mb-2">Admin Only Stats Check</h2>
                        <pre className="bg-surface border border-indigo-200 p-4 rounded text-sm">{JSON.stringify(adminData, null, 2)}</pre>
                    </div>
                )}

                <button
                    onClick={logout}
                    className="mt-8 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
