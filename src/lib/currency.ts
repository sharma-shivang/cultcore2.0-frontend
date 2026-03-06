/**
 * Format a number as Indian Rupees (₹) using the en-IN locale.
 * Example: formatINR(12500) → "₹12,500"
 */
export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}
