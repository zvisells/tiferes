import React from 'react';
import type { Metadata } from 'next';
import { Castoro, Poppins } from 'next/font/google';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';

const castoro = Castoro({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-castoro',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Tiferes L\'Moshe - Audio Discourse Archive',
  description:
    'A searchable database of audio shiurim (discourses) from Tiferes L\'Moshe.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${castoro.variable} ${poppins.variable}`}>
      <body className="font-poppins">
        <Navbar />
        <main className="min-h-screen bg-white">
          {children}
        </main>
        <footer className="bg-gray-100 text-center p-4 md:p-6 text-sm text-gray-600">
          <p>&copy; 2024 Tiferes L&apos;Moshe. All rights reserved.</p>
          <p className="mt-2">
            <a href="/admin" className="text-custom-accent hover:underline">
              Admin Login
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}

