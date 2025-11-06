'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Shiur } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import AudioPlayer from '@/components/AudioPlayer';
import TimestampsList from '@/components/TimestampsList';
import { Tag } from 'lucide-react';

export default async function ShiurDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  // Fetch shiur on server side
  const { data: shiur, error } = await supabase
    .from('shiurim')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single();

  if (error || !shiur) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Shiur not found.
      </div>
    );
  }

  return (
    <ShiurDetailContent shiur={shiur} />
  );
}

'use client';

function ShiurDetailContent({ shiur }: { shiur: Shiur }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTimestampClick = (time: string) => {
    const parts = time.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    }

    // Jump to time in audio player
    const audioElements = document.querySelectorAll('audio');
    if (audioElements.length > 0) {
      audioElements[0].currentTime = seconds;
      audioElements[0].play();
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-4xl mx-auto py-8">
      {/* Title */}
      <h1 className="text-4xl font-bold text-custom-accent">{shiur.title}</h1>

      {/* Meta Info */}
      <div className="flex flex-row gap-4 text-sm text-gray-600">
        <span>{new Date(shiur.created_at).toLocaleDateString()}</span>
        {shiur.tags && shiur.tags.length > 0 && (
          <div className="flex flex-row gap-2">
            {shiur.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {shiur.image_url && (
        <div className="w-full h-64 md:h-96 bg-gray-200 rounded-2xl overflow-hidden">
          <img
            src={shiur.image_url}
            alt={shiur.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Audio Player */}
      <AudioPlayer
        audioUrl={shiur.audio_url}
        allowDownload={shiur.allow_download}
      />

      {/* Timestamps */}
      {shiur.timestamps && shiur.timestamps.length > 0 && (
        <TimestampsList
          timestamps={shiur.timestamps}
          onTimestampClick={handleTimestampClick}
        />
      )}

      {/* Description */}
      {shiur.description && (
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-custom-accent">
            Description
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {shiur.description}
          </p>
        </div>
      )}

      {/* Transcript */}
      {shiur.transcript && (
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-custom-accent">
            Transcript
          </h2>
          <div className="bg-gray-50 p-4 md:p-6 rounded-2xl text-sm text-gray-700 whitespace-pre-wrap">
            {shiur.transcript}
          </div>
        </div>
      )}
    </div>
  );
}

