'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import DiscourseWidget from './DiscourseWidget';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar flex flex-row items-center justify-between p-4 md:p-6 bg-custom-accent gap-6">
      {/* Left: Logo + Navigation (desktop) */}
      <div className="hidden md:flex flex-row items-center gap-6">
        <Link href="/" className="text-xl font-bold text-white whitespace-nowrap">
          Tiferes L'Moshe
        </Link>
        <Link href="/" className="text-white hover:opacity-80 transition">
          Home
        </Link>
        <Link href="/about" className="text-white hover:opacity-80 transition">
          About
        </Link>
        <Link href="/contact" className="text-white hover:opacity-80 transition">
          Contact
        </Link>
      </div>

      {/* Right: Discourse Info + Buttons (hidden on mobile) */}
      <div className="hidden md:flex flex-row gap-6 items-center">
        <div className="hidden lg:block">
          <DiscourseWidget />
        </div>
        <Link
          href="/donate"
          className="px-4 py-2 rounded-lg font-semibold border border-white text-white hover:bg-white hover:text-custom-accent transition"
        >
          Donate
        </Link>
        <Link
          href="/book"
          className="px-4 py-2 rounded-lg font-semibold bg-white text-custom-accent hover:opacity-90 transition"
        >
          Buy Now
        </Link>
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
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="text-white hover:opacity-80 transition"
          >
            Contact
          </Link>
          <Link
            href="/donate"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-lg font-semibold border border-white text-white hover:bg-white hover:text-custom-accent transition text-center"
          >
            Donate
          </Link>
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 rounded-lg font-semibold bg-white text-custom-accent hover:opacity-90 transition text-center"
          >
            Buy Now
          </Link>

          {/* Next Discourse Widget at bottom */}
          <div className="mt-6 pt-4 border-t border-white">
            <DiscourseWidget />
          </div>
        </div>
      )}
    </nav>
  );
}

