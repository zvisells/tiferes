'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface NavSearchState {
  searchQuery: string;
  selectedParsha: string;
  viewMode: 'card' | 'row';
}

interface NavSearchContextValue extends NavSearchState {
  setSearchQuery: (q: string) => void;
  setSelectedParsha: (p: string) => void;
  setViewMode: (m: 'card' | 'row') => void;
}

const NavSearchContext = createContext<NavSearchContextValue | null>(null);

export function NavSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParsha, setSelectedParsha] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'row'>('card');

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setViewMode(isMobile ? 'row' : 'card');
  }, []);

  return (
    <NavSearchContext.Provider
      value={{
        searchQuery,
        selectedParsha,
        viewMode,
        setSearchQuery,
        setSelectedParsha,
        setViewMode,
      }}
    >
      {children}
    </NavSearchContext.Provider>
  );
}

export function useNavSearch() {
  const ctx = useContext(NavSearchContext);
  if (!ctx) throw new Error('useNavSearch must be used within NavSearchProvider');
  return ctx;
}
