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
    default: 'ElevateXG',
    template: '%s | ElevateXG'
  },
  description: 'Premium e-commerce platform by ElevateXG, offering curated elegance and innovative leadership.',
  keywords: ['e-commerce', 'premium', 'shopping', 'ElevateXG', 'jewelry', 'gems', 'consultancy'],
  authors: [{ name: 'ElevateXG Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://elevatexg.com',
    siteName: 'ElevateXG',
    title: 'ElevateXG | Premium E-Commerce',
    description: 'Discover curated excellence and visionary growth with ElevateXG.',
    images: [
      {
        url: 'https://elevatexg.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ElevateXG Premium E-Commerce',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ElevateXG | Premium E-Commerce',
    description: 'Discover premium products and visionary growth with ElevateXG',
    images: ['https://elevatexg.com/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col transition-colors duration-500 ease-in-out overflow-x-hidden`}>
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
