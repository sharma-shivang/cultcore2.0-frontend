'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/axios';
import {
    Users,
    ShoppingBag,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import SalesChart from './SalesChart';
import Link from 'next/link';

export default function Dashboard() {
    const [summary, setSummary] = useState<any>(null);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [summaryRes, salesRes, lowStockRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/sales-stats'),
                    api.get('/analytics/low-stock')
                ]);
                setSummary(summaryRes.data);
                setSalesData(salesRes.data);
                setLowStock(lowStockRes.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cta"></div>
            </div>
        );
    }

    const kpis = [
        {
            label: 'Total Revenue',
            value: formatINR(summary?.totalRevenue || 0),
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            label: 'Total Orders',
            value: summary?.totalOrders || 0,
            icon: ShoppingBag,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Total Customers',
            value: summary?.totalUsers || 0,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        }
    ];

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-sm flex items-center gap-6">
                        <div className={`${kpi.bg} p-4 rounded-xl`}>
                            <kpi.icon className={`${kpi.color} w-6 h-6`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-secondary-text">{kpi.label}</p>
                            <h4 className="text-2xl font-bold text-foreground mt-1">{kpi.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Chart Section */}
            <SalesChart data={salesData} />

            {/* Low Stock & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Low Stock Alert */}
                <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="text-yellow-500 w-5 h-5" />
                            <h3 className="text-xl font-bold text-foreground">Low Stock Alert</h3>
                        </div>
                        <Link href="/admin/products" className="text-cta text-sm font-medium hover:underline">
                            Manage Inventory
                        </Link>
                    </div>

                    {lowStock.length > 0 ? (
                        <div className="space-y-4">
                            {lowStock.map((prod) => (
                                <div key={prod._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition">
                                    <div>
                                        <p className="font-semibold text-foreground">{prod.title}</p>
                                        <p className="text-xs text-secondary-text">{prod.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${prod.stock <= 5 ? 'text-red-500' : 'text-yellow-600'}`}>
                                            {prod.stock} left
                                        </p>
                                        <p className="text-xs text-secondary-text">{formatINR(prod.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-secondary-text">
                            All products are sufficiently stocked. 🙌
                        </div>
                    )}
                </div>

                {/* Quick Actions / Summary Info */}
                <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-6">Store Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-sm text-secondary-text mb-1">Avg. Order Value</p>
                            <p className="text-xl font-bold">{formatINR(summary?.totalRevenue / (summary?.totalOrders || 1) || 0)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-sm text-secondary-text mb-1">Platform Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-lg font-bold">Healthy</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <button className="w-full py-3 bg-cta text-white rounded-xl font-bold hover:bg-cta-hover transition shadow-lg shadow-cta/20">
                            Export Sales Report
                        </button>
                        <button className="w-full py-3 bg-surface border border-primary/10 text-foreground rounded-xl font-bold hover:bg-primary/5 transition">
                            View Order Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
