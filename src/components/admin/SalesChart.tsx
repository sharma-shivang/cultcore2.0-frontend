'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { formatINR } from '@/lib/currency';

interface SalesChartProps {
    data: any[];
}

export default function SalesChart({ data }: SalesChartProps) {
    return (
        <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-foreground">Sales Over Time</h3>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="_id"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--secondary-text)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--secondary-text)', fontSize: 12 }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--secondary-text)', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--surface)',
                                borderColor: 'var(--primary-10)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: any, name: string | undefined) => {
                                if (name === 'revenue') return [formatINR(value), 'Revenue'];
                                return [value, 'Orders'];
                            }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            name="revenue"
                            stroke="var(--cta)"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: 'var(--surface)' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="orders"
                            name="orders"
                            stroke="var(--accent)"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: 'var(--surface)' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
