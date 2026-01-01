'use client';

import React from 'react';
import Link from 'next/link';
import { Shiur } from '@/lib/types';
import { Clock, Play, Tag } from 'lucide-react';

interface AudioRowProps {
  shiur: Shiur;
  isAdmin?: boolean;
}

export default function AudioRow({ shiur, isAdmin = false }: AudioRowProps) {
  const duration = shiur.duration || '--:--';

  return (
    <Link href={`/shiur/${shiur.slug}`}>
      <div className="flex flex-row items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
        {/* Image */}
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={shiur.image_url || '/temp-shiur-image.jpg'}
            alt={shiur.title}
            className={`w-full h-full object-cover ${!shiur.image_url ? 'opacity-10' : ''}`}
          />
        </div>

        {/* Content - Title, Description, Meta */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-custom-accent line-clamp-1">
            {shiur.title}
          </h3>

          {/* Description - Only on larger screens */}
          <p className="hidden md:block text-sm text-gray-600 line-clamp-1">
            {shiur.description}
          </p>

          {/* Timestamp + Duration */}
          <div className="flex flex-row items-center gap-3 text-xs text-gray-500">
            <div className="flex flex-row items-center gap-1">
              <Clock size={14} />
              <span>{duration}</span>
            </div>
            {isAdmin && (
              <span>
                {new Date(shiur.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Tags - separate row with hidden overflow */}
          {shiur.tags && shiur.tags.length > 0 && (
            <div className="flex flex-row gap-2 overflow-hidden">
              {shiur.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs flex-shrink-0"
                >
                  <Tag size={12} />
                  <span className="truncate max-w-[80px]">{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Play Button */}
        <button className="btn-primary flex flex-row items-center gap-2 flex-shrink-0">
          <Play size={16} />
          <span className="hidden md:inline">Listen</span>
        </button>
      </div>
    </Link>
  );
}

