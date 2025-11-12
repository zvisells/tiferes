'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AudioCard from '@/components/AudioCard';
import SearchBar, { FilterState } from '@/components/SearchBar';
import { Shiur } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 30;

export default function HomePage() {
  const [shiurim, setShiurim] = useState<Shiur[]>([]);
  const [filteredShiurim, setFilteredShiurim] = useState<Shiur[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

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

    setFilteredShiurim(filtered);
  }, [filters, shiurim]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredShiurim.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedShiurim = filteredShiurim.slice(startIdx, endIdx);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-6xl mx-auto w-full">
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
        <>
          <div className="w-full flex flex-row flex-wrap gap-6 justify-center">
            {/* Admin New Shiur Card */}
            {isAdmin && (
              <Link href="/admin/new" className="w-72">
                <div className="audio-card cursor-pointer hover:bg-gray-50 transition-colors flex flex-col h-full justify-center items-center">
                  {/* Content */}
                  <h3 className="text-lg font-semibold text-custom-accent text-center">
                    <Plus size={48} className="text-custom-accent mx-auto mb-4" />
                    New Shiur
                  </h3>
                  <div className="min-h-10"></div>
                  <div className="min-h-5"></div>
                  <div className="min-h-8"></div>
                </div>
              </Link>
            )}

            {/* Shiurim Cards */}
            {paginatedShiurim.length > 0 ? (
              paginatedShiurim.map((shiur) => (
                <div key={shiur.id} className="w-72">
                  <AudioCard shiur={shiur} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 w-full">
                No shiurim found. Try adjusting your filters.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

