'use client';

import React from 'react';
import { TimestampTopic } from '@/lib/types';
import { Clock } from 'lucide-react';

interface TimestampsListProps {
  timestamps: TimestampTopic[];
  onTimestampClick: (time: string) => void;
}

export default function TimestampsList({
  timestamps,
  onTimestampClick,
}: TimestampsListProps) {
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const handleTimestampClick = (time: string) => {
    onTimestampClick(time);
  };

  return (
    <div className="timestamps-list flex flex-col gap-2 p-4 md:p-6 rounded-2xl bg-gray-50">
      <h3 className="text-lg font-semibold text-custom-accent flex flex-row items-center gap-2">
        <Clock size={20} />
        Topics
      </h3>

      {timestamps && timestamps.length > 0 ? (
        <div className="flex flex-col gap-2">
          {timestamps.map((ts, idx) => (
            <button
              key={idx}
              onClick={() => handleTimestampClick(ts.time)}
              className="text-left p-3 rounded-lg hover:bg-custom-accent hover:text-white transition-colors flex flex-row justify-between items-center"
            >
              <span className="font-medium">{ts.topic}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {ts.time}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No timestamps available</p>
      )}
    </div>
  );
}

