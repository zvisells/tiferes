'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import AudioCard from '@/components/AudioCard';
import AudioRow from '@/components/AudioRow';
import { Shiur, inferMediaTypeFromUrl } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Play, Clock, Grid, List, TrendingUp } from 'lucide-react';
import { useNavSearch } from '@/lib/NavSearchContext';

const BATCH_SIZE = 24;
const SEARCH_RECORD_DELAY = 1500;

function naturalSortDesc(a: string, b: string): number {
  const chunkify = (s: string) =>
    s.split(/(\d+)/).map(part => (/^\d+$/.test(part) ? Number(part) : part.toLowerCase()));

  const aParts = chunkify(a);
  const bParts = chunkify(b);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] ?? '';
    const bVal = bParts[i] ?? '';

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      if (aVal !== bVal) return bVal - aVal;
    } else {
      const aStr = String(aVal);
      const bStr = String(bVal);
      if (aStr !== bStr) return bStr < aStr ? -1 : 1;
    }
  }
  return 0;
}

export default function HomePage() {
  const [shiurim, setShiurim] = useState<Shiur[]>([]);
  const [filteredShiurim, setFilteredShiurim] = useState<Shiur[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [trendingKeywords, setTrendingKeywords] = useState<{ query: string; count: number }[]>([]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchRecordTimer = useRef<NodeJS.Timeout | null>(null);

  const { searchQuery, selectedParsha, viewMode, setViewMode, setSearchQuery } = useNavSearch();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    fetch('/api/search-trends')
      .then(r => r.json())
      .then(setTrendingKeywords)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchRecordTimer.current) clearTimeout(searchRecordTimer.current);
    if (searchQuery.trim().length >= 3) {
      searchRecordTimer.current = setTimeout(() => {
        fetch('/api/search-trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        }).catch(() => {});
      }, SEARCH_RECORD_DELAY);
    }
    return () => {
      if (searchRecordTimer.current) clearTimeout(searchRecordTimer.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchShiurim = async () => {
      try {
        const { data, error } = await supabase
          .from('shiurim')
          .select('*');

        if (error) throw error;
        const sorted = (data || []).sort((a, b) => naturalSortDesc(a.title, b.title));
        setShiurim(sorted);
        setFilteredShiurim(sorted);
      } catch (error) {
        console.error('Error fetching shiurim:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShiurim();
  }, []);

  useEffect(() => {
    let filtered = [...shiurim];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
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

    if (selectedParsha) {
      filtered = filtered.filter((shiur) => shiur.parsha === selectedParsha);
    }

    setFilteredShiurim(filtered);
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, selectedParsha, shiurim]);

  const visibleShiurim = filteredShiurim.slice(0, visibleCount);
  const hasMore = visibleCount < filteredShiurim.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredShiurim.length));
  }, [filteredShiurim.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const hasActiveFilters = !!searchQuery || !!selectedParsha;

  const featuredShiur = useMemo(() => {
    if (hasActiveFilters || shiurim.length === 0) return null;
    return [...shiurim].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  }, [shiurim, hasActiveFilters]);

  const isVideo = (shiur: Shiur) =>
    (shiur.media_type || inferMediaTypeFromUrl(shiur.audio_url)) === 'video';

  const isNew = (shiur: Shiur) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return new Date(shiur.created_at).getTime() > sevenDaysAgo;
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Trending Keywords Ribbon */}
      {trendingKeywords.length > 0 && !loading && (
        <div className="flex flex-row items-center gap-2 overflow-x-auto no-scrollbar -mb-2">
          <TrendingUp size={14} className="text-gray-400 flex-shrink-0" />
          {trendingKeywords.map((kw) => (
            <button
              key={kw.query}
              onClick={() => setSearchQuery(kw.query)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${
                searchQuery.toLowerCase() === kw.query
                  ? 'bg-custom-accent text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {kw.query}
            </button>
          ))}
        </div>
      )}

      {/* Featured / Highlighted Shiur */}
      {featuredShiur && !loading && (
        <Link href={`/shiur/${featuredShiur.slug}`} className="group w-full">
          <div className="flex flex-col md:flex-row gap-5 md:gap-6 p-4 md:p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-shadow duration-300">
            <div className="relative w-full md:w-1/2 aspect-video bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={featuredShiur.image_url || '/temp-shiur-image.jpg'}
                alt={featuredShiur.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!featuredShiur.image_url ? 'opacity-10' : ''}`}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/60 rounded-full p-4">
                  <Play size={32} fill="white" className="text-white ml-1" />
                </div>
              </div>
              {isNew(featuredShiur) && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  NEW
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center gap-3 flex-1 min-w-0">
              <h3 className="text-2xl md:text-3xl font-bold text-custom-accent tracking-tight leading-tight">
                {featuredShiur.title}
              </h3>
              {featuredShiur.description && (
                <p className="text-gray-600 line-clamp-3 leading-relaxed">
                  {featuredShiur.description}
                </p>
              )}
              <div className="flex flex-row flex-wrap gap-3 items-center text-sm text-gray-500">
                {featuredShiur.duration && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {featuredShiur.duration}
                  </span>
                )}
                {featuredShiur.parsha && (
                  <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-600">
                    {featuredShiur.parsha}
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-custom-accent group-hover:underline">
                {isVideo(featuredShiur) ? 'Watch Now' : 'Listen Now'}
                <Play size={14} fill="currentColor" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Results Count + View Toggle */}
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm text-gray-500">
          {loading ? 'Loading...' : `${filteredShiurim.length} shiurim found`}
        </div>
        <div className="flex flex-row gap-1 p-1 rounded-full border border-gray-300 bg-white flex-shrink-0">
          <button
            onClick={() => setViewMode('card')}
            className={`p-1.5 rounded-full transition-colors ${
              viewMode === 'card'
                ? 'bg-custom-accent text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Card View"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('row')}
            className={`p-1.5 rounded-full transition-colors ${
              viewMode === 'row'
                ? 'bg-custom-accent text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Row View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Shiurim Display */}
      {loading ? (
        <div className="w-full flex flex-row flex-wrap gap-6 items-start justify-center animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[95%] md:w-72 flex flex-col gap-4 p-4 md:p-6 rounded-2xl border border-gray-200">
              <div className="w-full h-48 bg-gray-200 rounded-lg" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded w-16" />
                <div className="h-6 bg-gray-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="w-full flex flex-row flex-wrap gap-6 items-start justify-center">
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

              {visibleShiurim.length > 0 ? (
                visibleShiurim.map((shiur) => (
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
            <div className="w-full flex flex-col gap-4">
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

              {visibleShiurim.length > 0 ? (
                visibleShiurim.map((shiur) => (
                  <AudioRow key={shiur.id} shiur={shiur} isAdmin={isAdmin} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 w-full">
                  No shiurim found. Try adjusting your filters.
                </div>
              )}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="w-full h-1" />
          {hasMore && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-custom-accent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
