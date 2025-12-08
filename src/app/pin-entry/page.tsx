'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PinEntryPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        // Store PIN verification in sessionStorage
        sessionStorage.setItem('pin_verified', 'true');
        router.push('/');
      } else {
        setError('Invalid PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      setError('Error verifying PIN. Please try again.');
      console.error('PIN verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-custom-accent/5 to-custom-accent/10 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-castoro text-custom-accent mb-2">
            Tiferes L'Moshe
          </h1>
          <p className="text-gray-600 text-sm">Audio Discourse Archive</p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome!
          </h2>
          <p className="text-gray-600">
            Please enter the 4-digit PIN to continue
          </p>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              placeholder="••••"
              className="w-full text-center text-4xl tracking-widest font-semibold border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:border-custom-accent transition"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || pin.length !== 4}
            className="btn-primary w-full mt-6"
          >
            {isLoading ? 'Verifying...' : 'Enter'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Admin Login Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-3">Admin?</p>
          <Link
            href="/admin"
            className="inline-block text-custom-accent hover:underline font-semibold"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}

