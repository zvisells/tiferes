'use client';

import React, { useState } from 'react';
import { Clock, Plus } from 'lucide-react';

interface TimestampPickerProps {
  currentTime?: number;
  onAdd: (time: string, topic: string) => void;
}

export default function TimestampPicker({ currentTime = 0, onAdd }: TimestampPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [topic, setTopic] = useState('');

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleUseCurrentTime = () => {
    const h = Math.floor(currentTime / 3600);
    const m = Math.floor((currentTime % 3600) / 60);
    const s = Math.floor(currentTime % 60);
    setHours(h.toString());
    setMinutes(m.toString().padStart(2, '0'));
    setSeconds(s.toString().padStart(2, '0'));
  };

  const handleAdd = () => {
    const timeStr = `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    if (topic.trim()) {
      onAdd(timeStr, topic);
      setHours('0');
      setMinutes('0');
      setSeconds('0');
      setTopic('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row items-center gap-2 px-3 py-1 rounded bg-custom-accent text-white hover:opacity-90 text-xs"
      >
        <Clock size={14} />
        Pick Time
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 w-80">
          {/* Time Display */}
          <div className="mb-4 p-3 bg-gray-50 rounded text-center font-mono text-lg">
            {hours}:{minutes.padStart(2, '0')}:{seconds.padStart(2, '0')}
          </div>

          {/* Time Inputs */}
          <div className="flex flex-row gap-2 mb-4 items-end">
            <div className="flex flex-col flex-1">
              <label className="text-xs font-semibold mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)).toString())}
                className="w-full px-2 py-2 border border-gray-300 rounded text-sm text-center"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-xs font-semibold mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)).toString().padStart(2, '0'))}
                className="w-full px-2 py-2 border border-gray-300 rounded text-sm text-center"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-xs font-semibold mb-1">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)).toString().padStart(2, '0'))}
                className="w-full px-2 py-2 border border-gray-300 rounded text-sm text-center"
              />
            </div>
          </div>

          {/* Use Current Time Button */}
          {currentTime > 0 && (
            <button
              onClick={handleUseCurrentTime}
              className="w-full mb-3 px-3 py-2 text-xs rounded border border-custom-accent text-custom-accent hover:bg-custom-accent hover:text-white transition"
            >
              Use Current: {formatTime(currentTime)}
            </button>
          )}

          {/* Topic Input */}
          <div className="mb-4">
            <label className="text-xs font-semibold mb-1 block">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Introduction"
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-row gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!topic.trim()}
              className="flex-1 px-3 py-2 text-xs rounded bg-custom-accent text-white hover:opacity-90 disabled:opacity-50 flex flex-row items-center justify-center gap-1"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

