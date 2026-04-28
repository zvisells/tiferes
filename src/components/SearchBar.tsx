'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getParshiaList, isBookHeader, fetchCurrentParsha } from '@/lib/parshiot';

interface SearchBarProps {
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filters: FilterState) => void;
  variant?: 'standalone' | 'navbar';
  initialSearch?: string;
  initialParsha?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedParsha?: string;
}

export default function SearchBar({
  onSearchChange,
  onFilterChange,
  variant = 'standalone',
  initialSearch = '',
  initialParsha = '',
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedParsha, setSelectedParsha] = useState(initialParsha);
  const [currentWeekParsha, setCurrentWeekParsha] = useState<string | null>(null);
  const parshiot = getParshiaList();

  useEffect(() => {
    fetchCurrentParsha().then(setCurrentWeekParsha);
  }, []);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setSelectedParsha(initialParsha);
  }, [initialParsha]);

  const navigateToHome = useCallback((query: string, parsha: string) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (parsha) params.set('parsha', parsha);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }, [router]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (isHomePage && onSearchChange) {
        onSearchChange(value);
      }
    },
    [onSearchChange, isHomePage]
  );

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isHomePage) {
      navigateToHome(searchQuery, selectedParsha);
    }
  }, [isHomePage, searchQuery, selectedParsha, navigateToHome]);

  const handleParshaChange = useCallback((value: string) => {
    setSelectedParsha(value);
    if (!isHomePage) {
      navigateToHome(searchQuery, value);
    }
  }, [isHomePage, searchQuery, navigateToHome]);

  const handleFilterChange = useCallback(() => {
    if (isHomePage) {
      onFilterChange?.({
        searchQuery,
        selectedParsha: selectedParsha || undefined,
      });
    }
  }, [searchQuery, selectedParsha, onFilterChange, isHomePage]);

  useEffect(() => {
    handleFilterChange();
  }, [searchQuery, selectedParsha, handleFilterChange]);

  const isNavbar = variant === 'navbar';

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={`w-full flex flex-row items-center gap-2 md:gap-3 ${
        isNavbar ? 'py-2 md:py-2.5' : 'py-4 md:py-5'
      }`}
    >
      {/* Search Input */}
      <div className={`flex-1 min-w-0 flex flex-row items-center gap-2 px-3 md:px-4 py-2 rounded-full border transition-all ${
        isNavbar
          ? 'border-white/30 bg-white/10 focus-within:bg-white/20 focus-within:border-white/50'
          : 'border-gray-300 bg-white focus-within:ring-2 focus-within:ring-custom-accent focus-within:border-transparent'
      }`}>
        <Search size={16} className={isNavbar ? 'text-white/60 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={`flex-1 min-w-0 bg-transparent focus:outline-none text-sm ${
            isNavbar
              ? 'text-white placeholder-white/50'
              : 'text-gray-700 placeholder-gray-400'
          }`}
        />
      </div>

      {/* Parsha Filter */}
      <select
        value={selectedParsha}
        onChange={(e) => handleParshaChange(e.target.value)}
        className={`w-28 md:w-auto md:min-w-[140px] px-3 md:px-4 py-2 rounded-full border focus:outline-none text-sm truncate ${
          isNavbar
            ? 'border-white/30 bg-white/10 text-white focus:bg-white/20 focus:border-white/50 [&>option]:text-gray-700'
            : 'border-gray-300 bg-white text-gray-700 focus:ring-2 focus:ring-custom-accent'
        }`}
      >
        <option value="">All Parshios</option>
        {currentWeekParsha && (
          <option value={currentWeekParsha}>
            This Week: {currentWeekParsha}
          </option>
        )}
        {parshiot.map((parsha) => (
          <option
            key={parsha}
            value={isBookHeader(parsha) ? '' : parsha}
            disabled={isBookHeader(parsha)}
            className={isBookHeader(parsha) ? 'font-bold text-custom-accent' : ''}
          >
            {isBookHeader(parsha) ? `── ${parsha} ──` : parsha}
            {parsha === currentWeekParsha ? ' ★' : ''}
          </option>
        ))}
      </select>

    </form>
  );
}
