import type { Metadata } from 'next';
import { Chakra_Petch, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  variable: '--font-chakra-petch',
  weight: ['600', '700'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TraceHop · Know before you ape',
  description: 'Real-time multi-chain wallet intelligence layer. Trace funding graphs and detect rugs before you ape.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${chakraPetch.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-[#06040d] text-white">
        {children}
      </body>
    </html>
  );
}
