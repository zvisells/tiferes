'use client';

import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  searchQuery: string;
  selectedTopic?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function SearchBar({
  onSearchChange,
  onFilterChange,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
      selectedTopic: selectedTopic || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }, [searchQuery, selectedTopic, dateFrom, dateTo, onFilterChange]);

  React.useEffect(() => {
    handleFilterChange();
  }, [searchQuery, selectedTopic, dateFrom, dateTo, handleFilterChange]);

  return (
    <div className="filter-bar flex-col md:flex-row">
      {/* Search Input - Takes up most space */}
      <div className="flex-1 flex flex-row items-center gap-2">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search shiurim..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input flex-1"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-2 md:w-auto">
        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="search-input min-w-32"
        >
          <option value="">All Topics</option>
          {/* Topics will be dynamically populated */}
        </select>

        {/* Date Range */}
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="search-input"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
    </div>
  );
}

