'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Eye, Video } from 'lucide-react';
import { inferMediaTypeFromUrl } from '@/lib/types';

interface PopularShiur {
  id: string;
  title: string;
  slug: string;
  image_url?: string;
  duration?: string;
  created_at: string;
  media_type?: string;
  audio_url: string;
  views: number;
}

export default function PopularShiurim({ excludeId }: { excludeId: string }) {
  const [popular, setPopular] = useState<PopularShiur[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollIdx, setScrollIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/views/popular?exclude=${excludeId}`)
      .then(r => r.json())
      .then((data) => {
        setPopular(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [excludeId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 overflow-hidden">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-full md:w-1/3 flex-shrink-0 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
              <div className="h-3 bg-gray-100 rounded mt-2 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (popular.length === 0) return null;

  const isVideoType = (s: PopularShiur) =>
    (s.media_type || inferMediaTypeFromUrl(s.audio_url)) === 'video';

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop: row of 3 */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {popular.map((shiur) => (
          <Link key={shiur.id} href={`/shiur/${shiur.slug}`} className="group">
            <div className="flex flex-col gap-2">
              <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden">
                <img
                  src={shiur.image_url || '/temp-shiur-image.jpg'}
                  alt={shiur.title}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!shiur.image_url ? 'opacity-10' : ''}`}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/50 rounded-full p-3">
                    {isVideoType(shiur) ? <Video size={20} className="text-white" /> : <Play size={20} fill="white" className="text-white ml-0.5" />}
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {shiur.duration || '--:--'}
                </div>
              </div>
              <h4 className="text-sm font-semibold text-custom-accent line-clamp-2 group-hover:underline">
                {shiur.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Eye size={12} />
                <span>{shiur.views} views</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile: horizontal carousel */}
      <div className="md:hidden relative">
        <div
          className="flex flex-row transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${scrollIdx * 100}%)` }}
        >
          {popular.map((shiur) => (
            <Link
              key={shiur.id}
              href={`/shiur/${shiur.slug}`}
              className="w-full flex-shrink-0 px-1 group"
            >
              <div className="flex flex-col gap-2">
                <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={shiur.image_url || '/temp-shiur-image.jpg'}
                    alt={shiur.title}
                    className={`w-full h-full object-cover ${!shiur.image_url ? 'opacity-10' : ''}`}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {shiur.duration || '--:--'}
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-custom-accent line-clamp-2">
                  {shiur.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Eye size={12} />
                  <span>{shiur.views} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Carousel dots */}
        {popular.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {popular.map((_, i) => (
              <button
                key={i}
                onClick={() => setScrollIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === scrollIdx ? 'bg-custom-accent' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
