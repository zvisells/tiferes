'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminNavbar from './AdminNavbar';

export default function AdminNavbarWrapper() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAdmin(!!data.session);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading || !isAdmin) {
    return null;
  }

  return <AdminNavbar />;
}

