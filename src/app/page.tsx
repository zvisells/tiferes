'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AudioCard from '@/components/AudioCard';
import SearchBar, { FilterState } from '@/components/SearchBar';
import { Shiur } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Plus } from 'lucide-react';

export default function HomePage() {
  const [shiurim, setShiurim] = useState<Shiur[]>([]);
  const [filteredShiurim, setFilteredShiurim] = useState<Shiur[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };
    checkAdmin();
  }, []);

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
      <SearchBar 
        onSearchChange={(query) => {
          setFilters(prev => ({ ...prev, searchQuery: query }));
        }}
        onFilterChange={setFilters} 
      />

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        {loading ? 'Loading...' : `${filteredShiurim.length} shiurim found`}
      </div>

      {/* Shiurim Cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading shiurim...
        </div>
      ) : (
        <div className="flex flex-row flex-wrap gap-6">
          {/* Admin New Shiur Card */}
          {isAdmin && (
            <Link href="/admin/new" className="flex-1 min-w-72">
              <div className="audio-card cursor-pointer hover:bg-gray-50 transition-colors flex flex-col h-full justify-center items-center">
                {/* Image placeholder */}
                <div className="w-full aspect-video bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center mb-4">
                  <Plus size={48} className="text-custom-accent" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-custom-accent text-center">
                  New Shiur
                </h3>
                <div className="min-h-10"></div>
                <div className="min-h-5"></div>
                <div className="min-h-8"></div>
              </div>
            </Link>
          )}

          {/* Shiurim Cards */}
          {filteredShiurim.length > 0 ? (
            filteredShiurim.map((shiur) => (
              <div key={shiur.id} className="flex-1 min-w-72">
                <AudioCard shiur={shiur} />
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 w-full">
              No shiurim found. Try adjusting your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

