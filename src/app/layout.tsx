import React from 'react';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import AdminNavbarWrapper from '@/components/AdminNavbarWrapper';

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
    <html lang="en">
      <body>
        <AdminNavbarWrapper />
        <Navbar />
        <main className="min-h-screen bg-white">
          {children}
        </main>
        <footer className="bg-gray-100 text-center p-4 md:p-6 text-sm text-gray-600">
          <p>&copy; 2024 Tiferes L&apos;Moshe. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

