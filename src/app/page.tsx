'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AudioCard from '@/components/AudioCard';
import AudioRow from '@/components/AudioRow';
import SearchBar, { FilterState } from '@/components/SearchBar';
import { Shiur } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 33;

export default function HomePage() {
  const [shiurim, setShiurim] = useState<Shiur[]>([]);
  const [filteredShiurim, setFilteredShiurim] = useState<Shiur[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'row'>('card');

  // Detect device type and set default view mode
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setViewMode(isMobile ? 'row' : 'card');
  }, []);

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

    // Parsha filter
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

    // Parsha filter
    if (filters.selectedParsha) {
      filtered = filtered.filter((shiur) => shiur.parsha === filters.selectedParsha);
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
      {/* Search & Filter Bar - Sticky on mobile */}
      <div className="md:relative md:top-0 md:z-40 sticky top-[72px] z-30 bg-white -mx-4 px-4 md:mx-0 md:px-0">
        <SearchBar 
          onSearchChange={(query) => {
            setFilters(prev => ({ ...prev, searchQuery: query }));
          }}
          onFilterChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        {loading ? 'Loading...' : `${filteredShiurim.length} shiurim found`}
      </div>

      {/* Shiurim Display */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading shiurim...
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            /* Card View */
            <div className="w-full flex flex-row flex-wrap gap-6 items-start justify-center">
              {/* Admin New Shiur Card */}
              {isAdmin && (
                <Link href="/admin/new" className="w-[95%] md:w-72">
                  <div className="audio-card cursor-pointer hover:bg-gray-50 transition-colors flex flex-col justify-center items-center">
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
                  <div key={shiur.id} className="w-[95%] md:w-72">
                    <AudioCard shiur={shiur} isAdmin={isAdmin} />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 w-full">
                  No shiurim found. Try adjusting your filters.
                </div>
              )}
            </div>
          ) : (
            /* Row View */
            <div className="w-full flex flex-col gap-4">
              {/* Admin New Shiur Row */}
              {isAdmin && (
                <Link href="/admin/new">
                  <div className="flex flex-row items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Plus size={32} className="text-custom-accent flex-shrink-0" />
                    <span className="text-lg font-semibold text-custom-accent">
                      New Shiur
                    </span>
                  </div>
                </Link>
              )}

              {/* Shiurim Rows */}
              {paginatedShiurim.length > 0 ? (
                paginatedShiurim.map((shiur) => (
                  <AudioRow key={shiur.id} shiur={shiur} isAdmin={isAdmin} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 w-full">
                  No shiurim found. Try adjusting your filters.
                </div>
              )}
            </div>
          )}

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

