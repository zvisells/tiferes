'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AdminTabNav from '@/components/AdminTabNav';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [sponsorLink, setSponsorLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/admin');
      } else {
        setIsCheckingAuth(false);
        // Fetch current settings
        fetchSettings();
      }
    };
    checkAuth();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/site-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.sponsor_link) {
          setSponsorLink(data.sponsor_link);
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (pin !== pinConfirm) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_pin: pin }),
      });

      if (!response.ok) {
        throw new Error('Failed to update PIN');
      }

      setSuccess('PIN updated successfully!');
      setPin('');
      setPinConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSponsorLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!sponsorLink.trim()) {
      setError('Sponsor link cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsor_link: sponsorLink }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sponsor link');
      }

      setSuccess('Sponsor link updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sponsor link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl min-w-[1000px] mx-auto py-8 flex flex-col gap-6">
      {/* Tab Navigation */}
      <AdminTabNav />

      {/* PIN Settings Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold text-custom-accent mb-6">
          Website PIN
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Set a 4-digit PIN that visitors must enter to access the website. Admin users can bypass this PIN.
        </p>

        <form onSubmit={handleSavePin} className="space-y-4">
          {/* New PIN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New PIN (4 digits)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(value);
              }}
              placeholder="••••"
              className="search-input text-center text-2xl tracking-widest"
            />
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPinConfirm(value);
              }}
              placeholder="••••"
              className="search-input text-center text-2xl tracking-widest"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || pin.length !== 4 || pinConfirm.length !== 4}
            className="btn-primary w-full mt-6"
          >
            {isLoading ? 'Updating...' : 'Update PIN'}
          </button>
        </form>
      </div>

      {/* Sponsor Link Settings Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold text-custom-accent mb-6">
          Sponsor a Shiur Link
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Set the URL for the "Sponsor a Shiur" button shown to users.
        </p>

        <form onSubmit={handleSaveSponsorLink} className="space-y-4">
          {/* Sponsor Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sponsor Link URL
            </label>
            <input
              type="url"
              value={sponsorLink}
              onChange={(e) => setSponsorLink(e.target.value)}
              placeholder="https://example.com/sponsor"
              className="search-input"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !sponsorLink.trim()}
            className="btn-primary w-full mt-6"
          >
            {isLoading ? 'Updating...' : 'Update Sponsor Link'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}
    </div>
  );
}

