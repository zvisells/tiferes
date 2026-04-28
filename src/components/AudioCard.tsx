'use client';

import React from 'react';
import Link from 'next/link';
import { Shiur, inferMediaTypeFromUrl } from '@/lib/types';
import { Clock, Play, Tag, Video } from 'lucide-react';

interface AudioCardProps {
  shiur: Shiur;
  isAdmin?: boolean;
}

export default function AudioCard({ shiur, isAdmin = false }: AudioCardProps) {
  const duration = shiur.duration || '--:--';
  const isVideo = (shiur.media_type || inferMediaTypeFromUrl(shiur.audio_url)) === 'video';
  const isNew = Date.now() - new Date(shiur.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <Link href={`/shiur/${shiur.slug}`}>
      <div className="audio-card cursor-pointer group">
        {/* Image with hover zoom + play overlay */}
        <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-3">
          <img
            src={shiur.image_url || '/temp-shiur-image.jpg'}
            alt={shiur.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!shiur.image_url ? 'opacity-10' : ''}`}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/50 rounded-full p-3">
              {isVideo ? <Video size={24} className="text-white" /> : <Play size={24} fill="white" className="text-white ml-0.5" />}
            </div>
          </div>
          {isNew && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
              NEW
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-custom-accent min-h-7">
          {isNew && <span className="text-red-500 text-xs font-bold mr-1.5 align-middle">NEW</span>}
          {shiur.title}
        </h3>

        {/* Description */}
        <div className="min-h-10">
          {shiur.description && (
            <p className="text-sm text-gray-700 line-clamp-2">
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

        {/* Tags */}
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
      </div>
    </Link>
  );
}
