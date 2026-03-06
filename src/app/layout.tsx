import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ElevateX | Premium E-Commerce',
    template: '%s | ElevateX'
  },
  description: 'Scalable e-commerce platform built with Next.js and NestJS',
  keywords: ['e-commerce', 'premium', 'shopping', 'elevatex'],
  authors: [{ name: 'ElevateX Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://elevatex.com',
    siteName: 'ElevateX',
    title: 'ElevateX | Premium E-Commerce',
    description: 'Scalable e-commerce platform built with Next.js and NestJS',
    images: [
      {
        url: 'https://elevatex.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ElevateX Premium E-Commerce',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ElevateX | Premium E-Commerce',
    description: 'Discover premium products on ElevateX',
    images: ['https://elevatex.com/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col transition-colors duration-500 ease-in-out`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
