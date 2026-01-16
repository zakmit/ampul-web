import type { Metadata } from 'next';
import { Averia_Serif_Libre } from 'next/font/google';
import { Zilla_Slab } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { ShoppingBagProvider } from '@/components/providers/ShoppingBagProvider';
import { LoadingOverlayProvider } from '@/components/providers/LoadingOverlayProvider';
import { auth } from '@/auth';

const aSLibre = Averia_Serif_Libre({
  weight: ["300","400","700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-title",
})

const ziliaSlab = Zilla_Slab({
  weight: ["300","400","500","600","700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-context",
})

export const metadata: Metadata = {
  title: "AMPUL",
  description: "Inspired by the traditional concept of ampoules—a small vessel preserving what remains of a life. What was the scent of the decisive moment in their life?",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${aSLibre.variable} ${ziliaSlab.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <ShoppingBagProvider>
            <LoadingOverlayProvider>
              {children}
            </LoadingOverlayProvider>
          </ShoppingBagProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
