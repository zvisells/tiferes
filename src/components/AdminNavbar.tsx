'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutAdmin } from '@/lib/auth';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="bg-green-600 text-white p-3 md:p-4 flex flex-row items-center justify-between">
      {/* Left: Welcome */}
      <div className="text-sm md:text-base font-semibold">
        Welcome, Admin
      </div>

      {/* Right: Dashboard & Logout */}
      <div className="flex flex-row gap-4 items-center">
        <Link
          href="/admin/dashboard"
          className="flex flex-row items-center gap-2 hover:opacity-80 transition text-sm md:text-base"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="flex flex-row items-center gap-2 hover:opacity-80 transition text-sm md:text-base"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

