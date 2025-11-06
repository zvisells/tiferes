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
        {/* Image */}
        {shiur.image_url && (
          <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={shiur.image_url}
              alt={shiur.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-custom-accent">
          {shiur.title}
        </h3>

        {/* Description */}
        {shiur.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {shiur.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-row gap-4 text-xs text-gray-500">
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

        {/* Tags */}
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

        {/* Play Button */}
        <div className="flex flex-row gap-2 mt-4">
          <button className="btn-primary flex flex-row items-center gap-2">
            <Play size={16} />
            Listen
          </button>
        </div>
      </div>
    </Link>
  );
}

