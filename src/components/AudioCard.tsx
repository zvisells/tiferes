'use client';

import React from 'react';
import Link from 'next/link';
import { Shiur } from '@/lib/types';
import { Play, Clock, Tag } from 'lucide-react';

interface AudioCardProps {
  shiur: Shiur;
}

export default function AudioCard({ shiur }: AudioCardProps) {
  // Parse duration from audio if available (for now, placeholder)
  const duration = '45:30';

  return (
    <Link href={`/shiur/${shiur.slug}`}>
      <div className="audio-card cursor-pointer hover:bg-gray-50 transition-colors">
        {/* Image - 16:9 aspect ratio with min height and placeholder */}
        <div className="w-full aspect-video min-h-48 bg-gray-200 rounded-lg overflow-hidden">
          {shiur.image_url ? (
            <img
              src={shiur.image_url}
              alt={shiur.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
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
          <div className="flex flex-row items-center gap-1">
            <span>
              {new Date(shiur.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tags - consistent height */}
        <div className="min-h-8 flex items-start">
          {shiur.tags && shiur.tags.length > 0 && (
            <div className="flex flex-row gap-2 flex-wrap">
              {shiur.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex flex-row items-center gap-1"
                >
                  <Tag size={12} />
                  {tag}
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

