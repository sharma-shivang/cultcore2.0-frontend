import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t py-2 bg-surface">
            <div className="container flex flex-col items-center justify-between gap-6 md:h-12 md:flex-row mx-auto px-4">
                <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                    <p className="text-sm font-bold text-primary tracking-tight">
                        © 2026 Cult Core
                    </p>
                    <nav className="flex items-center gap-6">
                        <Link href="/about" className="text-sm font-medium text-secondary-text hover:text-cta transition-colors">
                            About Us
                        </Link>
                        <Link href="/products" className="text-sm font-medium text-secondary-text hover:text-cta transition-colors">
                            Products
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-xs text-secondary-text">
                    </p>
                </div>
            </div>
        </footer>
    );
}
