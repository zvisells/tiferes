'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type AdminTab = 'pages' | 'settings';

export default function AdminHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('pages');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/admin');
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-4xl mx-auto py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="flex flex-row items-center gap-2 text-custom-accent hover:opacity-80 transition w-fit"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      {/* Header */}
      <h1 className="text-4xl font-bold text-custom-accent">Admin Hub</h1>

      {/* Tabs */}
      <div className="flex flex-row gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${
            activeTab === 'pages'
              ? 'text-custom-accent border-custom-accent'
              : 'text-gray-600 border-transparent hover:text-custom-accent'
          }`}
        >
          Pages
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-semibold transition border-b-2 ${
            activeTab === 'settings'
              ? 'text-custom-accent border-custom-accent'
              : 'text-gray-600 border-transparent hover:text-custom-accent'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'pages' && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">Manage your custom pages here.</p>
            <Link
              href="/admin/pages"
              className="btn-primary w-fit"
            >
              Go to Pages Management
            </Link>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">Manage site settings and security.</p>
            <Link
              href="/admin/settings"
              className="btn-primary w-fit"
            >
              Go to Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

