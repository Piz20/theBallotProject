import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import ApolloWrapper from './ApolloWrapper'; // Import du composant client

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TheBallotProject - Make Electoral Process Easier',
  description: 'TheBallotProject helps organizations streamline their electoral processes.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloWrapper>
          {children}
        </ApolloWrapper>
        <Toaster />
      </body>
    </html>
  );
}
