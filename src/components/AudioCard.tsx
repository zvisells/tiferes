'use client';

import React from 'react';
import Link from 'next/link';
import { Shiur } from '@/lib/types';
import { Clock, Play, Tag } from 'lucide-react';

interface AudioCardProps {
  shiur: Shiur;
  isAdmin?: boolean;
}

export default function AudioCard({ shiur, isAdmin = false }: AudioCardProps) {
  // Use saved duration from DB, or show placeholder
  const duration = shiur.duration || '--:--';

  return (
    <Link href={`/shiur/${shiur.slug}`}>
      <div className="audio-card cursor-pointer hover:bg-gray-50 transition-colors">
        {/* Image */}
        <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-3">
          <img
            src={shiur.image_url || '@content/temp-shiur-image.jpg'}
            alt={shiur.title}
            className={`w-full h-full object-cover ${!shiur.image_url ? 'opacity-50' : ''}`}
          />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-custom-accent min-h-7">
          {shiur.title}
        </h3>

        {/* Description - 2 line height minimum */}
        <div className="min-h-10">
          {shiur.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {shiur.description}
            </p>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex flex-row gap-4 text-xs text-gray-500 min-h-5">
          <div className="flex flex-row items-center gap-1">
            <Clock size={14} />
            <span>{duration}</span>
          </div>
          {isAdmin && (
            <div className="flex flex-row items-center gap-1">
              <span>
                {new Date(shiur.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Tags - single line with ellipsis, no wrap */}
        <div className="min-h-8 flex items-start overflow-hidden">
          {shiur.tags && shiur.tags.length > 0 && (
            <div className="flex flex-row gap-2 overflow-hidden whitespace-nowrap">
              {shiur.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex flex-row items-center gap-1 flex-shrink-0"
                >
                  <Tag size={12} />
                  <span className="truncate max-w-[100px]">{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Play Button - always at bottom */}
        <div className="flex flex-row gap-2 mt-auto pt-2">
          <button className="btn-primary flex flex-row items-center gap-2">
            <Play size={16} />
            Listen
          </button>
        </div>
      </div>
    </Link>
  );
}
