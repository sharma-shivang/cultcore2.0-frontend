'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const [mounted, setMounted] = React.useState(false);
    const { setTheme, theme } = useTheme();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9" aria-hidden="true" />; // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="relative p-2 rounded-full hover:bg-surface border border-transparent hover:border-primary/20 transition-all duration-500 ease-out hover:rotate-12 hover:scale-110"
            aria-label="Toggle theme"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-500 ease-out dark:-rotate-90 dark:scale-0 text-foreground" />
            <Moon className="absolute h-5 w-5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 scale-0 transition-all duration-500 ease-out dark:rotate-0 dark:scale-100 text-foreground" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
