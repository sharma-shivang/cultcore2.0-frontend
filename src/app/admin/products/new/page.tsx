import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewProductPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/products"
                    className="p-2 hover:bg-surface rounded-lg transition-colors text-secondary-text hover:text-foreground"
                >
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
                    <p className="text-secondary-text mt-1">Add a new item to your store catalog.</p>
                </div>
            </div>

            <ProductForm />
        </div>
    );
}
