'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminTabNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-row gap-2 border-b border-gray-200">
      <Link
        href="/admin/pages"
        className={`px-6 py-3 font-semibold transition border-b-2 ${
          pathname === '/admin/pages'
            ? 'text-custom-accent border-custom-accent'
            : 'border-transparent text-gray-600 hover:text-custom-accent'
        }`}
      >
        Pages
      </Link>
      <Link
        href="/admin/settings"
        className={`px-6 py-3 font-semibold transition border-b-2 ${
          pathname === '/admin/settings'
            ? 'text-custom-accent border-custom-accent'
            : 'border-transparent text-gray-600 hover:text-custom-accent'
        }`}
      >
        Settings
      </Link>
    </div>
  );
}

