'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, Settings, Calendar, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { logoutAdmin } from '@/lib/auth';
import { useNavSearch } from '@/lib/NavSearchContext';
import DiscourseWidget from './DiscourseWidget';
import SearchBar from './SearchBar';

interface NavPage {
  id: string;
  slug: string;
  title: string;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pages, setPages] = useState<NavPage[]>([]);
  const [discourseOpen, setDiscourseOpen] = useState(false);
  const discourseRef = useRef<HTMLDivElement>(null);
  const discourseTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isHomePage = pathname === '/';
  const isAdminLoginPage = pathname === '/admin' || pathname === '/admin/reset-password';

  const {
    searchQuery, setSearchQuery,
    selectedParsha, setSelectedParsha,
  } = useNavSearch();

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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (discourseRef.current && !discourseRef.current.contains(e.target as Node)) {
        setDiscourseOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleDiscourseEnter = () => {
    if (discourseTimeout.current) clearTimeout(discourseTimeout.current);
    setDiscourseOpen(true);
  };
  const handleDiscourseLeave = () => {
    discourseTimeout.current = setTimeout(() => setDiscourseOpen(false), 300);
  };

  if (isAdminLoginPage) return null;

  return (
    <>
      <nav className="navbar sticky top-0 z-50 backdrop-blur-lg font-castoro nav-gradient">
        {/* Row 1: Logo, Links, Upcoming Shiur, Admin */}
        <div className="max-w-6xl mx-auto w-full flex flex-row items-center justify-between px-4 md:px-6 py-3">
          {/* Mobile: hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-white p-1"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Desktop: Logo + Nav Links */}
          <div className="hidden md:flex flex-row items-center gap-8">
            <Link href="/" className="flex flex-row items-center gap-2 flex-shrink-0">
              <img src="/logo.png" alt="Tiferes L'Moshe Logo" className="h-10 w-auto" />
            </Link>
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/pages/${page.slug}`}
                className={`nav-link text-white text-sm tracking-wide transition ${isActive(`/pages/${page.slug}`) ? 'active opacity-100' : 'opacity-80 hover:opacity-100'}`}
              >
                {page.title}
              </Link>
            ))}
            <Link
              href="/contact"
              className={`nav-link text-white text-sm tracking-wide transition ${isActive('/contact') ? 'active opacity-100' : 'opacity-80 hover:opacity-100'}`}
            >
              Contact
            </Link>
          </div>

          {/* Mobile: centered logo + calendar icon */}
          <div className="md:hidden flex flex-row items-center justify-center flex-1">
            <Link href="/" className="flex flex-row items-center gap-2">
              <img src="/logo.png" alt="Tiferes L'Moshe Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Mobile: Upcoming Shiur calendar icon (far right) */}
          <div className="md:hidden relative" ref={discourseRef}>
            <button
              onClick={() => setDiscourseOpen(!discourseOpen)}
              className="bg-white/15 hover:bg-white/25 text-white rounded-full p-2 transition"
              aria-label="Upcoming Shiur"
            >
              <Info size={18} />
            </button>
            {discourseOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-custom-accent border border-white/20 rounded-xl shadow-2xl p-4 z-50">
                <DiscourseWidget />
              </div>
            )}
          </div>

          {/* Desktop right side: Upcoming Shiur dropdown + Admin */}
          <div className="hidden md:flex flex-row gap-4 items-center">
            <div
              className="relative"
              onMouseEnter={handleDiscourseEnter}
              onMouseLeave={handleDiscourseLeave}
            >
              <button
                onClick={() => setDiscourseOpen(!discourseOpen)}
                className="flex flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm transition"
              >
                <Info size={14} />
                Upcoming Shiur
              </button>
              {discourseOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-custom-accent border border-white/20 rounded-xl shadow-2xl p-4 z-50">
                  <DiscourseWidget />
                </div>
              )}
            </div>

            {isAdmin && (
              <>
                <Link
                  href="/admin/pages"
                  className="px-3 py-1.5 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition flex items-center gap-1.5"
                >
                  <Settings size={14} />
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition flex items-center gap-1.5"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Integrated Search Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto w-full px-4 md:px-6">
            <SearchBar
              variant="navbar"
              onSearchChange={isHomePage ? setSearchQuery : undefined}
              onFilterChange={isHomePage ? (f) => {
                setSearchQuery(f.searchQuery);
                setSelectedParsha(f.selectedParsha || '');
              } : undefined}
              initialSearch={searchQuery}
              initialParsha={selectedParsha}
            />
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`absolute top-0 left-0 h-full w-4/5 max-w-xs bg-custom-accent flex flex-col transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white/80 hover:text-white transition p-1"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation links */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-8">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/pages/${page.slug}`}
                onClick={() => setMenuOpen(false)}
                className={`nav-link text-white text-2xl font-medium tracking-wide py-4 w-full text-center transition ${
                  isActive(`/pages/${page.slug}`) ? 'active opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {page.title}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className={`nav-link text-white text-2xl font-medium tracking-wide py-4 w-full text-center transition ${
                isActive('/contact') ? 'active opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Contact
            </Link>

            {isAdmin && (
              <>
                <div className="w-16 border-t border-white/20 my-4" />
                <Link
                  href="/admin/pages"
                  onClick={() => setMenuOpen(false)}
                  className="text-white text-xl tracking-wide py-3 w-full text-center opacity-70 hover:opacity-100 transition flex items-center justify-center gap-2"
                >
                  <Settings size={20} />
                  Admin
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="text-white text-xl tracking-wide py-3 w-full text-center opacity-70 hover:opacity-100 transition flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Upcoming Shiur at bottom of drawer */}
          <div className="p-6 border-t border-white/10">
            <DiscourseWidget />
          </div>
        </div>
      </div>
    </>
  );
}
