'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Maximize,
  Minimize,
} from 'lucide-react';
import { TimestampTopic, MediaType } from '@/lib/types';

interface AudioPlayerProps {
  audioUrl: string;
  mediaType?: MediaType;
  posterUrl?: string;
  title?: string;
  shiurId?: string;
  allowDownload?: boolean;
  onTimeUpdate?: (time: number) => void;
  timestamps?: TimestampTopic[];
}

export default function AudioPlayer({
  audioUrl,
  mediaType = 'audio',
  posterUrl,
  title,
  shiurId,
  allowDownload = false,
  onTimeUpdate,
  timestamps = [],
}: AudioPlayerProps) {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewRecorded = useRef(false);
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [mobileControlsVisible, setMobileControlsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const isVideo = mediaType === 'video';

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.volume = 1;
    setVolume(1);
  }, []);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const updateTime = () => {
      setCurrentTime(media.currentTime);
      onTimeUpdate?.(media.currentTime);
    };
    const updateDuration = () => setDuration(media.duration);
    const onEnded = () => setIsPlaying(false);

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('loadedmetadata', updateDuration);
    media.addEventListener('ended', onEnded);

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('loadedmetadata', updateDuration);
      media.removeEventListener('ended', onEnded);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || 'Shiur',
      artist: "Tiferes L'Moshe",
      ...(posterUrl ? { artwork: [{ src: posterUrl, sizes: '512x512', type: 'image/jpeg' }] } : {}),
    });
    navigator.mediaSession.setActionHandler('play', () => {
      mediaRef.current?.play();
      setIsPlaying(true);
      if (!hasStarted) setHasStarted(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      mediaRef.current?.pause();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      if (mediaRef.current) mediaRef.current.currentTime = Math.max(0, mediaRef.current.currentTime - 10);
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      if (mediaRef.current) mediaRef.current.currentTime = Math.min(mediaRef.current.duration || 0, mediaRef.current.currentTime + 10);
    });
  }, [title, posterUrl, hasStarted]);

  useEffect(() => {
    if (!shiurId || viewRecorded.current) return;

    if (isPlaying) {
      viewTimerRef.current = setTimeout(() => {
        if (!viewRecorded.current) {
          viewRecorded.current = true;
          fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shiurId }),
          }).catch(() => {});
        }
      }, 5000);
    } else {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
        viewTimerRef.current = null;
      }
    }

    return () => {
      if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
    };
  }, [isPlaying, shiurId]);

  const handlePlayPause = useCallback(() => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
        if (!hasStarted) setHasStarted(true);
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, hasStarted]);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
      setMobileControlsVisible(false);
    }, 1500);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const handleVideoClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input')) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      if (!mobileControlsVisible) {
        setMobileControlsVisible(true);
        scheduleHide();
      } else {
        handlePlayPause();
        scheduleHide();
      }
    } else {
      handlePlayPause();
    }
  };

  const handleControlInteraction = () => {
    cancelHide();
    scheduleHide();
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
    handleControlInteraction();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) mediaRef.current.volume = newVolume;
  };

  const handleMute = () => {
    if (mediaRef.current) {
      if (isMuted) {
        mediaRef.current.volume = volume;
      } else {
        mediaRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (mediaRef.current) mediaRef.current.playbackRate = speed;
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2, 2.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    handleSpeedChange(speeds[nextIndex]);
    handleControlInteraction();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeStringToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const controlsVisible = (showControls || mobileControlsVisible) && hasStarted;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-none bg-black select-none ${isFullscreen ? 'flex flex-col justify-center h-screen' : ''}`}
      onMouseEnter={() => { cancelHide(); setShowControls(true); }}
      onMouseLeave={() => { if (hasStarted) scheduleHide(); }}
      onMouseMove={() => { if (!hasStarted) return; cancelHide(); setShowControls(true); scheduleHide(); }}
    >
      {isVideo ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={audioUrl}
          preload="metadata"
          poster={posterUrl}
          playsInline
          onClick={handleVideoClick}
          className="w-full bg-black cursor-pointer"
          style={{ maxHeight: isFullscreen ? '100vh' : '500px' }}
        />
      ) : (
        <>
          <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={audioUrl} preload="metadata" />
          <div
            className="w-full aspect-video bg-gray-900 cursor-pointer flex items-center justify-center overflow-hidden"
            onClick={handleVideoClick}
            style={{ maxHeight: isFullscreen ? '100vh' : '500px' }}
          >
            {posterUrl ? (
              <img src={posterUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950" />
            )}
          </div>
        </>
      )}

      {/* Big centered play button — before first play or when paused */}
      {(!hasStarted || !isPlaying) && (
        <button
          onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="bg-black/50 rounded-full p-5 hover:bg-black/70 transition">
            <Play size={48} fill="white" className="text-white ml-1" />
          </div>
        </button>
      )}

      {/* Controls overlay — bottom gradient bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-8 pb-3 flex flex-col gap-2 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="flex flex-col gap-1">
          <div className="relative w-full h-2 flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={isNaN(currentTime) ? 0 : currentTime}
              onChange={handleProgressChange}
              className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer relative z-10"
              style={{ background: 'transparent' }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-white/30 rounded-lg pointer-events-none" />
            {duration > 0 && timestamps.map((ts, idx) => {
              const position = (timeStringToSeconds(ts.time) / duration) * 100;
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
          <div className="flex flex-row justify-between text-xs text-white/80">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons row */}
        <div className="flex flex-row items-center gap-3">
          <button onClick={() => { handlePlayPause(); handleControlInteraction(); }} className="text-white hover:opacity-80 transition">
            {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
          </button>

          {/* Volume (desktop only) */}
          <div className="hidden md:flex flex-row items-center gap-1">
            <button onClick={handleMute} className="text-white">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex-1" />

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            className="text-xs font-semibold text-white hover:opacity-80 transition px-2 py-1"
          >
            {playbackSpeed}x
          </button>

          {/* Download */}
          {allowDownload && (
            <a href={audioUrl} download className="text-white hover:opacity-80 transition p-1">
              <Download size={18} />
            </a>
          )}

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white hover:opacity-80 transition p-1">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
