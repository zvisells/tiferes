'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
} from 'lucide-react';
import { TimestampTopic } from '@/lib/types';

interface AudioPlayerProps {
  audioUrl: string;
  allowDownload?: boolean;
  onTimeUpdate?: (time: number) => void;
  timestamps?: TimestampTopic[];
}

export default function AudioPlayer({
  audioUrl,
  allowDownload = false,
  onTimeUpdate,
  timestamps = [],
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Debug logging
  React.useEffect(() => {
    console.log('🎵 AudioPlayer received audioUrl:', audioUrl);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [onTimeUpdate]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert timestamp string (HH:MM:SS or MM:SS) to seconds
  const timeStringToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  return (
    <div className="audio-player flex flex-col gap-4 p-4 md:p-6 rounded-2xl bg-gray-50">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Player Controls */}
      <div className="flex flex-row items-center gap-4">
        <button
          onClick={handlePlayPause}
          className="btn-primary p-3 rounded-full flex items-center justify-center"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        {/* Progress Bar with Timestamp Markers */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="relative w-full">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={isNaN(currentTime) ? 0 : currentTime}
              onChange={handleProgressChange}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer relative z-10"
              style={{ background: 'transparent' }}
            />
            {/* Background track */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-gray-300 rounded-lg pointer-events-none" />
            
            {/* Timestamp markers */}
            {duration > 0 && timestamps.map((ts, idx) => {
              const timestampSeconds = timeStringToSeconds(ts.time);
              const position = (timestampSeconds / duration) * 100;
              return (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-custom-accent pointer-events-none z-0"
                  style={{ left: `${position}%` }}
                  title={ts.topic}
                />
              );
            })}
          </div>
          <div className="flex flex-row justify-between text-xs text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="hidden md:flex flex-row items-center gap-2">
          <button onClick={handleMute} className="text-custom-accent">
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Playback Speed Control */}
        <div className="relative">
          <select
            value={playbackSpeed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="text-xs md:text-sm bg-white border border-gray-300 rounded px-2 py-1 cursor-pointer hover:bg-gray-50 transition"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="1.75">1.75x</option>
            <option value="2">2x</option>
          </select>
        </div>

        {/* Download Button */}
        {allowDownload && (
          <a
            href={audioUrl}
            download
            className="btn-secondary p-2 rounded-full flex items-center justify-center"
          >
            <Download size={20} />
          </a>
        )}
      </div>
    </div>
  );
}

