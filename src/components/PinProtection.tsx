'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import PinEntryPage from '@/app/pin-entry/page';

interface PinProtectionProps {
  children: React.ReactNode;
}

export default function PinProtection({ children }: PinProtectionProps) {
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPinEntry, setShowPinEntry] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Admin routes, pin-entry, and API routes don't need PIN verification
      const publicRoutes = ['/admin', '/pin-entry', '/api'];
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

      if (isPublicRoute) {
        setIsVerified(true);
        setIsLoading(false);
        return;
      }

      // Check if PIN verification is already in session
      const verified = sessionStorage.getItem('pin_verified');
      if (verified === 'true') {
        setIsVerified(true);
        setShowPinEntry(false);
        setIsLoading(false);
        return;
      }

      // Check if PIN is required
      try {
        const response = await fetch('/api/verify-pin');
        const data = await response.json();
        
        if (data.pin_required) {
          setShowPinEntry(true);
          setIsVerified(false);
        } else {
          setIsVerified(true);
          setShowPinEntry(false);
        }
      } catch (error) {
        console.error('Error checking PIN requirement:', error);
        setIsVerified(true);
        setShowPinEntry(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [pathname]);

  // Listen for storage changes (when PIN is verified in another tab/window or same window)
  useEffect(() => {
    const handleStorageChange = () => {
      const verified = sessionStorage.getItem('pin_verified');
      if (verified === 'true') {
        setIsVerified(true);
        setShowPinEntry(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showPinEntry && !isVerified) {
    return <PinEntryPage />;
  }

  return <>{children}</>;
}
