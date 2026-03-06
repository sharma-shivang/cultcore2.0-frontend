import Dashboard from '@/components/admin/Dashboard';

export default function AdminDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Admin Overview</h1>
                <p className="text-lg text-secondary-text mt-2 italic">Performance metrics and inventory health at a glance.</p>
            </div>

            <Dashboard />
        </div>
    );
}
