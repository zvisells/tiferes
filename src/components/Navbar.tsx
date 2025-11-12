'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { logoutAdmin } from '@/lib/auth';
import DiscourseWidget from './DiscourseWidget';

interface NavPage {
  id: string;
  slug: string;
  title: string;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pages, setPages] = useState<NavPage[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch('/api/pages');
        if (res.ok) {
          const data = await res.json();
          setPages(data);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      }
    };
    fetchPages();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="navbar flex flex-row items-center justify-between p-4 md:p-6 bg-custom-accent gap-6">
      {/* LEFT: Navigation Links (desktop) */}
      <div className="hidden md:flex flex-row items-center gap-6 flex-1">
        <Link href="/" className="text-white hover:opacity-80 transition">
          Home
        </Link>
        <Link href="/about" className="text-white hover:opacity-80 transition">
          About
        </Link>
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/pages/${page.slug}`}
            className="text-white hover:opacity-80 transition"
          >
            {page.title}
          </Link>
        ))}
        <Link href="/contact" className="text-white hover:opacity-80 transition">
          Contact
        </Link>
      </div>

      {/* CENTER: Logo (desktop) */}
      <div className="hidden md:flex flex-row items-center justify-center flex-1">
        <Link href="/" className="flex flex-row items-center gap-2">
          <img 
            src="/logo.png" 
            alt="Tiferes L'Moshe Logo"
            className="h-16 w-auto"
          />
        </Link>
      </div>

      {/* RIGHT: Discourse Info + Buttons (desktop) */}
      <div className="hidden md:flex flex-row gap-6 items-center justify-end flex-1">
        <div className="hidden lg:block">
          <DiscourseWidget />
        </div>
        <Link
          href="/book"
          className="px-4 py-2 rounded-lg font-semibold bg-white text-custom-accent hover:opacity-90 transition"
        >
          Buy Now
        </Link>
        {isAdmin && (
          <>
            <Link
              href="/admin/pages"
              className="px-4 py-2 rounded-lg font-semibold border border-white text-white hover:bg-white hover:text-custom-accent transition flex flex-row items-center gap-2"
            >
              <Settings size={16} />
              Pages
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-semibold border border-white text-white hover:bg-white hover:text-custom-accent transition flex flex-row items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-white"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-custom-accent border-b border-white flex flex-col gap-4 p-4 md:hidden">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-white hover:opacity-80 transition"
          >
            Home
          </Link>
          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
            className="text-white hover:opacity-80 transition"
          >
            About
          </Link>
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/pages/${page.slug}`}
              onClick={() => setMenuOpen(false)}
              className="text-white hover:opacity-80 transition"
            >
              {page.title}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="text-white hover:opacity-80 transition"
          >
            Contact
          </Link>
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-lg font-semibold bg-white text-custom-accent hover:opacity-90 transition text-center"
          >
            Buy Now
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/admin/pages"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 rounded-lg font-semibold border border-white text-white hover:bg-white hover:text-custom-accent transition text-center w-full flex flex-row items-center justify-center gap-2"
              >
                <Settings size={16} />
                Pages
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="px-4 py-2 rounded-lg font-semibold border border-white text-white hover:bg-white hover:text-custom-accent transition text-center w-full flex flex-row items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}

          {/* Next Discourse Widget at bottom */}
          <div className="mt-6 pt-4 border-t border-white">
            <DiscourseWidget />
          </div>
        </div>
      )}
    </nav>
  );
}

