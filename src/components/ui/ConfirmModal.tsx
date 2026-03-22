'use client';

import { useEffect, useCallback } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning';
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isLoading = false,
    variant = 'danger',
}: ConfirmModalProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        },
        [isLoading, onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const confirmBtnClass =
        variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
            : 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400 text-white';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="confirm-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Panel */}
            <div
                className="relative z-10 w-full max-w-md bg-surface border border-primary/10 rounded-2xl shadow-2xl
                           animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary-text hover:text-foreground hover:bg-primary/10 transition disabled:opacity-40"
                    aria-label="Close modal"
                >
                    <X size={16} />
                </button>

                <div className="p-7">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${variant === 'danger'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        }`}>
                        <AlertTriangle size={22} />
                    </div>

                    {/* Content */}
                    <h2
                        id="confirm-modal-title"
                        className="text-lg font-bold text-foreground mb-2"
                    >
                        {title}
                    </h2>
                    <p className="text-sm text-secondary-text leading-relaxed mb-7">
                        {description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-primary/20
                                       text-secondary-text hover:text-foreground hover:bg-primary/5 transition disabled:opacity-40"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-60 ${confirmBtnClass}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Processing…
                                </>
                            ) : (
                                confirmLabel
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
