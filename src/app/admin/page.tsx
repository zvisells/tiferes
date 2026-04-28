'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin, resetPassword } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginAdmin(email, password);
      router.push('/');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-custom-accent mb-6 text-center">
          {showReset ? 'Reset Password' : 'Admin Login'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {resetSent ? (
          <div className="flex flex-col gap-4 items-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded w-full text-center">
              Password reset link sent to <strong>{email}</strong>. Check your inbox.
            </div>
            <button
              onClick={() => { setShowReset(false); setResetSent(false); setError(''); }}
              className="text-sm text-custom-accent hover:underline"
            >
              Back to login
            </button>
          </div>
        ) : showReset ? (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="search-input"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => { setShowReset(false); setError(''); }}
              className="text-sm text-custom-accent hover:underline text-center"
            >
              Back to login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="search-input"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="search-input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <button
              type="button"
              onClick={() => { setShowReset(true); setError(''); }}
              className="text-sm text-gray-500 hover:text-custom-accent text-center mt-1"
            >
              Forgot password?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
