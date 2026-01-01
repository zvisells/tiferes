'use client';

import React, { useState, useCallback } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { getParshiaList } from '@/lib/parshiot';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  onFilterChange?: (filters: FilterState) => void;
  viewMode?: 'card' | 'row';
  onViewModeChange?: (mode: 'card' | 'row') => void;
}

export interface FilterState {
  searchQuery: string;
  selectedParsha?: string;
}

export default function SearchBar({
  onSearchChange,
  onFilterChange,
  viewMode = 'card',
  onViewModeChange,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParsha, setSelectedParsha] = useState('');
  const parshiot = getParshiaList();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearchChange(value);
    },
    [onSearchChange]
  );

  const handleFilterChange = useCallback(() => {
    onFilterChange?.({
      searchQuery,
      selectedParsha: selectedParsha || undefined,
    });
  }, [searchQuery, selectedParsha, onFilterChange]);

  React.useEffect(() => {
    handleFilterChange();
  }, [searchQuery, selectedParsha, handleFilterChange]);

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-6 rounded-2xl bg-gray-50">
      {/* Search Input - Full width on its own row */}
      <div className="flex-1 flex flex-row items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white">
        <Search size={20} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search shiurim..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Parsha Filter and View Toggle on same row */}
      <div className="flex flex-row gap-4">
        {/* Parsha Filter */}
        <select
          value={selectedParsha}
          onChange={(e) => setSelectedParsha(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent bg-white text-gray-700"
        >
          <option value="">All Parshios</option>
          {parshiot.map((parsha) => (
            <option key={parsha} value={parsha}>
              {parsha.includes('**') ? parsha.replace(/\*\*/g, '') + ' 📖' : parsha}
            </option>
          ))}
        </select>

        {/* View Toggle */}
        {onViewModeChange && (
          <div className="flex flex-row gap-2 p-1 rounded-lg border border-gray-300 bg-white">
            <button
              onClick={() => onViewModeChange('card')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'card'
                  ? 'bg-custom-accent text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Card View"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => onViewModeChange('row')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'row'
                  ? 'bg-custom-accent text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Row View"
            >
              <List size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
