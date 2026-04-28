import React from 'react';
import { Castoro, Poppins } from 'next/font/google';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import FloatingSponsorButton from '@/components/FloatingSponsorButton';
import PinProtection from '@/components/PinProtection';
import { NavSearchProvider } from '@/lib/NavSearchContext';
import ScrollToTop from '@/components/ScrollToTop';

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

export const metadata = {
  title: 'Tiferes L\'Moshe - Audio Discourse Archive',
  description: 'A searchable database of audio shiurim (discourses) from Tiferes L\'Moshe.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${castoro.variable} ${poppins.variable}`}>
      <body className="font-poppins min-h-screen flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;window.addEventListener('scroll',function(){document.documentElement.classList.add('is-scrolling');clearTimeout(t);t=setTimeout(function(){document.documentElement.classList.remove('is-scrolling')},1200)},{passive:true})})();`,
          }}
        />
        <NavSearchProvider>
          <ScrollToTop />
          <PinProtection>
            <Navbar />
            <FloatingSponsorButton />
            <main className="bg-white flex-1">
              {children}
            </main>
            <footer className="bg-custom-accent text-center p-6 md:p-8 text-sm text-white/70">
              <p>&copy; 2024 Tiferes L&apos;Moshe. All rights reserved.</p>
              <p className="mt-2">
                <a href="/admin" className="text-white/50 hover:text-white transition">
                  Admin Login
                </a>
              </p>
            </footer>
          </PinProtection>
        </NavSearchProvider>
      </body>
    </html>
  );
}
