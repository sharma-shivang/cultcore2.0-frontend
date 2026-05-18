'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    role: string;
    name?: string;
    picture?: string;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    login: (accessToken: string, refreshToken: string, redirectTo?: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to robustly decode JWT in browser
const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        // Convert base64url to base64
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // Add padding if necessary
        const pad = base64.length % 4;
        if (pad) {
            if (pad === 1) throw new Error('Invalid base64 string');
            base64 += new Array(5 - pad).join('=');
        }

        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to decode JWT:', e);
        return null;
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('accessToken');
        if (token) {
            const decoded = decodeJwt(token);
            if (decoded) {
                setUser({
                    id: decoded.sub,
                    email: decoded.email || '',
                    name: decoded.name || '',
                    picture: decoded.picture || '',
                    role: decoded.role
                });
            } else {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback((accessToken: string, refreshToken: string, redirectTo?: string) => {
        Cookies.set('accessToken', accessToken, { expires: 3 / 24 });
        Cookies.set('refreshToken', refreshToken, { expires: 7 });

        const decoded = decodeJwt(accessToken);
        if (decoded) {
            const userRole = decoded.role;
            setUser({
                id: decoded.sub,
                email: decoded.email || '',
                name: decoded.name || '',
                picture: decoded.picture || '',
                role: userRole
            });

            let target = redirectTo;
            if (!target || target === '/') {
                target = userRole === 'admin' ? '/admin' : '/';
            }

            router.push(target);
            router.refresh();
        } else {
            console.error('Login failed: Invalid token structure');
        }
    }, [router]);

    const logout = useCallback(() => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        setUser(null);
        router.push('/login');
        router.refresh();
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
