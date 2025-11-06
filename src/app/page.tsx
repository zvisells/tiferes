'use client';

import React, { useEffect, useState } from 'react';
import AudioCard from '@/components/AudioCard';
import SearchBar, { FilterState } from '@/components/SearchBar';
import { Shiur } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [shiurim, setShiurim] = useState<Shiur[]>([]);
  const [filteredShiurim, setFilteredShiurim] = useState<Shiur[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
  });

  // Fetch all shiurim on mount
  useEffect(() => {
    const fetchShiurim = async () => {
      try {
        const { data, error } = await supabase
          .from('shiurim')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setShiurim(data || []);
        setFilteredShiurim(data || []);
      } catch (error) {
        console.error('Error fetching shiurim:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShiurim();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...shiurim];

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (shiur) =>
          shiur.title.toLowerCase().includes(query) ||
          shiur.description?.toLowerCase().includes(query) ||
          shiur.tags?.some((tag) =>
            tag.toLowerCase().includes(query)
          ) ||
          shiur.timestamps?.some((ts) =>
            ts.topic.toLowerCase().includes(query)
          )
      );
    }

    // Topic filter
    if (filters.selectedTopic) {
      filtered = filtered.filter((shiur) =>
        shiur.timestamps?.some((ts) => ts.topic === filters.selectedTopic)
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filtered = filtered.filter(
        (shiur) => new Date(shiur.created_at) >= dateFrom
      );
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (shiur) => new Date(shiur.created_at) <= dateTo
      );
    }

    setFilteredShiurim(filtered);
  }, [filters, shiurim]);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Search & Filter Bar */}
      <SearchBar onFilterChange={setFilters} />

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        {loading ? 'Loading...' : `${filteredShiurim.length} shiurim found`}
      </div>

      {/* Shiurim Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading shiurim...
        </div>
      ) : filteredShiurim.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShiurim.map((shiur) => (
            <AudioCard key={shiur.id} shiur={shiur} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No shiurim found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

