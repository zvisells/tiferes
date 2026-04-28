'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shiur, inferMediaTypeFromUrl, detectMediaType } from '@/lib/types';
import AudioPlayer from '@/components/AudioPlayer';
import TimestampsList from '@/components/TimestampsList';
import TimestampPicker from '@/components/TimestampPicker';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Tag, Edit2, Check, X, Trash2, Heart, Share2, Eye } from 'lucide-react';
import { getParshiaList } from '@/lib/parshiot';
import PopularShiurim from '@/components/PopularShiurim';
import DropZone from '@/components/DropZone';

export default function ShiurDetailContent({ shiur: initialShiur }: { shiur: Shiur }) {
  const router = useRouter();
  const [shiur, setShiur] = useState(initialShiur);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editedData, setEditedData] = useState({
    title: initialShiur.title,
    description: initialShiur.description || '',
    tags: initialShiur.tags.join(', '),
    parsha: initialShiur.parsha || '',
    allow_download: initialShiur.allow_download,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [newMediaType, setNewMediaType] = useState<'audio' | 'video' | null>(null);
  const [editedTimestamps, setEditedTimestamps] = useState(
    initialShiur.timestamps || []
  );
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [likeCount, setLikeCount] = useState(initialShiur.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    const cookieMatch = document.cookie.match(new RegExp(`liked_${initialShiur.id}=1`));
    if (cookieMatch) setHasLiked(true);
  }, [initialShiur.id]);

  useEffect(() => {
    fetch(`/api/views?shiurId=${initialShiur.id}`)
      .then(r => r.json())
      .then(data => setViewCount(data.count || 0))
      .catch(() => setViewCount(0));
  }, [initialShiur.id]);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };
    checkAdmin();
  }, []);

  // Track audio time for timestamp picker
  useEffect(() => {
    const mediaElement = document.querySelector(
      (initialShiur.media_type || inferMediaTypeFromUrl(initialShiur.audio_url)) === 'video' ? 'video' : 'audio'
    ) as HTMLMediaElement | null;
    if (!mediaElement) return;

    const updateTime = () => {
      setCurrentTime(mediaElement.currentTime);
    };

    mediaElement.addEventListener('timeupdate', updateTime);
    return () => mediaElement.removeEventListener('timeupdate', updateTime);
  }, [initialShiur.media_type, initialShiur.audio_url]);

  const handleLike = async () => {
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
    try {
      if (hasLiked) {
        const res = await fetch('/api/likes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shiurId: shiur.id }),
        });
        if (res.ok) {
          const { likes } = await res.json();
          setLikeCount(likes);
          setHasLiked(false);
        }
      } else {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shiurId: shiur.id }),
        });
        if (res.ok) {
          const { likes } = await res.json();
          setLikeCount(likes);
          setHasLiked(true);
        }
      }
    } catch {
      // silently fail
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: shiur.title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setToast({ message: 'Link copied to clipboard', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const tags = editedData.tags.split(',').map((t) => t.trim());
      const updateData: any = {
        title: editedData.title,
        description: editedData.description,
        tags,
        parsha: editedData.parsha,
        allow_download: editedData.allow_download,
      };

      // Helper to upload file with progress tracking
      const uploadWithProgress = async (file: File, fileType: string): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
          // Get presigned URL first
          fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&fileType=${fileType}`)
            .then((response) => {
              if (!response.ok) throw new Error('Failed to get presigned URL');
              return response.json();
            })
            .then(({ presignedUrl, publicUrl }) => {
              const xhr = new XMLHttpRequest();

              xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                  const percentComplete = Math.round((event.loaded / event.total) * 100);
                  setUploadProgress(percentComplete);
                }
              });

              xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                  setUploadProgress(0);
                  resolve(publicUrl);
                } else {
                  setUploadProgress(0);
                  reject(new Error(`Upload failed: ${xhr.status}`));
                }
              });

              xhr.addEventListener('error', () => {
                setUploadProgress(0);
                reject(new Error('Upload failed: network error'));
              });

              xhr.open('PUT', presignedUrl);
              xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
              xhr.send(file);
            })
            .catch((error) => {
              setUploadProgress(0);
              reject(error);
            });
        });
      };

      // Upload new audio file if provided
      if (mediaFile) {
        try {
          const uploadFolder = (newMediaType || detectMediaType(mediaFile)) === 'video' ? 'video' : 'audio';
          const mediaUrl = await uploadWithProgress(mediaFile, uploadFolder);
          updateData.audio_url = mediaUrl;
          updateData.media_type = newMediaType || detectMediaType(mediaFile);

          const el = updateData.media_type === 'video'
            ? document.createElement('video')
            : new Audio();
          const duration = await new Promise<string>((resolve) => {
            const url = URL.createObjectURL(mediaFile);
            el.src = url;

            const handleMetadata = () => {
              const totalSeconds = Math.floor(el.duration);
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              const seconds = totalSeconds % 60;

              let durationStr = '';
              if (hours > 0) {
                durationStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              } else {
                durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
              }

              resolve(durationStr);
              URL.revokeObjectURL(url);
            };

            el.addEventListener('loadedmetadata', handleMetadata);
            el.addEventListener('error', () => {
              resolve(shiur.duration || '--:--');
              URL.revokeObjectURL(url);
            });
          });

          updateData.duration = duration;
        } catch (error) {
          console.error('Media upload failed:', error);
        }
      }

      // Upload new image file if provided
      if (imageFile) {
        try {
          const imageUrl = await uploadWithProgress(imageFile, 'image');
          updateData.image_url = imageUrl;
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      }

      // Auto-generate thumbnail from new video if no image was explicitly provided
      const effectiveType = newMediaType || (mediaFile ? detectMediaType(mediaFile) : shiur.media_type);
      if (mediaFile && effectiveType === 'video' && !imageFile) {
        try {
          const thumbBlob = await new Promise<Blob | null>((resolve) => {
            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            video.preload = 'auto';
            const url = URL.createObjectURL(mediaFile);
            video.src = url;

            video.addEventListener('loadeddata', () => {
              video.currentTime = 0.1;
            });

            video.addEventListener('seeked', () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob(
                    (blob) => {
                      URL.revokeObjectURL(url);
                      resolve(blob);
                    },
                    'image/jpeg',
                    0.85
                  );
                } else {
                  URL.revokeObjectURL(url);
                  resolve(null);
                }
              } catch {
                URL.revokeObjectURL(url);
                resolve(null);
              }
            });

            video.addEventListener('error', () => {
              URL.revokeObjectURL(url);
              resolve(null);
            });
          });

          if (thumbBlob) {
            const thumbFile = new File([thumbBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
            const thumbUrl = await uploadWithProgress(thumbFile, 'image');
            updateData.image_url = thumbUrl;
            console.log('✅ Auto-generated video thumbnail uploaded');
          }
        } catch (err) {
          console.warn('Could not auto-generate video thumbnail:', err);
        }
      }

      // Update timestamps if changed
      if (editedTimestamps.length > 0 || (shiur.timestamps && shiur.timestamps.length > 0)) {
        updateData.timestamps = editedTimestamps;
      }

      const { error } = await supabase
        .from('shiurim')
        .update(updateData)
        .eq('id', shiur.id);

      if (error) throw error;

      setShiur({
        ...shiur,
        ...updateData,
      });

      setIsEditing(false);
      setImageFile(null);
      setMediaFile(null);
      setNewMediaType(null);
      setEditedTimestamps(editedTimestamps);
      setToast({ message: 'Shiur updated successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ message: 'Failed to save changes', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this shiur? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shiurim')
        .delete()
        .eq('id', shiur.id);

      if (error) throw error;

      setToast({ message: 'Shiur deleted successfully', type: 'success' });
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      setToast({ message: 'Failed to delete shiur', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleCancel = () => {
    setEditedData({
      title: shiur.title,
      description: shiur.description || '',
      tags: shiur.tags.join(', '),
      parsha: shiur.parsha || '',
      allow_download: shiur.allow_download,
    });
    setImageFile(null);
    setMediaFile(null);
    setNewMediaType(null);
    setEditedTimestamps(shiur.timestamps || []);
    setIsEditing(false);
  };

  const handleTimestampClick = (time: string) => {
    const parts = time.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    }

    const mediaElements = document.querySelectorAll(isVideo ? 'video' : 'audio');
    if (mediaElements.length > 0) {
      (mediaElements[0] as HTMLMediaElement).currentTime = seconds;
      (mediaElements[0] as HTMLMediaElement).play();
    }
  };

  const handleAddTimestamp = (time: string, topic: string) => {
    setEditedTimestamps([...editedTimestamps, { time, topic }]);
  };

  const effectiveMediaType = shiur.media_type || inferMediaTypeFromUrl(shiur.audio_url);
  const isVideo = effectiveMediaType === 'video';

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 max-w-4xl mx-auto pt-2 md:pt-8 pb-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg font-semibold text-white z-50 animate-pulse ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}


      {/* Top Actions */}
      <div className="flex flex-row gap-2 items-center justify-between flex-wrap">
        <div className="flex flex-row gap-2 items-center">
          {/* Edit Mode Toggle */}
          {isAdmin && (
            <>
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex flex-row items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 flex flex-row items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex flex-row items-center gap-2 relative overflow-hidden"
                  >
                    {/* Progress bar background */}
                    {isSaving && uploadProgress > 0 && (
                      <div
                        className="absolute inset-0 bg-custom-accent/30 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    )}
                    {/* Button content */}
                    <span className="relative z-10 flex flex-row items-center gap-2">
                      <Check size={18} />
                      {isSaving ? `Saving... ${uploadProgress > 0 ? `${uploadProgress}%` : ''}` : 'Save'}
                    </span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <X size={18} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Form — matches AdminForm style */}
      {isEditing && (
        <div className="flex flex-col gap-6">
          {/* File Uploads — media first */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Audio / Video</label>
              <DropZone
                accept="audio/*,video/*"
                label="Drop media to replace"
                sublabel="or click to browse"
                icon="media"
                file={mediaFile}
                onFileChange={(file) => {
                  setMediaFile(file);
                  if (file) setNewMediaType(detectMediaType(file));
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cover Image <span className="normal-case font-normal text-gray-400">(optional)</span>
              </label>
              <DropZone
                accept="image/*"
                label="Drop image to replace"
                sublabel="or click to browse"
                icon="image"
                file={imageFile}
                onFileChange={setImageFile}
                previewUrl={shiur.image_url || undefined}
              />
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={editedData.title}
              onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent text-lg font-semibold text-custom-accent"
            />
          </div>

          {/* Tags + Parsha — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</label>
              <input
                type="text"
                value={editedData.tags}
                onChange={(e) => setEditedData({ ...editedData, tags: e.target.value })}
                placeholder="Comma-separated"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parsha</label>
              <select
                value={editedData.parsha}
                onChange={(e) => setEditedData({ ...editedData, parsha: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent text-sm bg-white"
              >
                <option value="">Select a Parsha...</option>
                {getParshiaList().map((parsha) => (
                  <option key={parsha} value={parsha}>
                    {parsha.includes('**') ? parsha.replace(/\*\*/g, '') + ' 📖' : parsha}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            <textarea
              value={editedData.description}
              onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent text-sm min-h-32 resize-y"
            />
          </div>

          {/* Download Toggle */}
          <label className="flex flex-row items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={editedData.allow_download}
                onChange={(e) =>
                  setEditedData((prev) => ({
                    ...prev,
                    allow_download: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-200 peer-checked:bg-custom-accent rounded-full transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
            </div>
            <span className="text-sm text-gray-700">Allow users to download media</span>
          </label>

          {/* Timestamps */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-row items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamps</label>
              <TimestampPicker currentTime={currentTime} onAdd={handleAddTimestamp} />
            </div>
            {editedTimestamps.length > 0 && (
              <div className="flex flex-col gap-2">
                {editedTimestamps.map((ts, idx) => (
                  <div key={idx} className="flex flex-row items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200">
                    <span className="text-xs bg-custom-accent/10 text-custom-accent px-2 py-1 rounded font-mono">
                      {ts.time}
                    </span>
                    <input
                      type="text"
                      value={ts.topic}
                      onChange={(e) => {
                        const updated = [...editedTimestamps];
                        updated[idx].topic = e.target.value;
                        setEditedTimestamps(updated);
                      }}
                      className="flex-1 bg-transparent focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => setEditedTimestamps(editedTimestamps.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {editedTimestamps.length === 0 && (
              <p className="text-xs text-gray-500">No timestamps yet</p>
            )}
          </div>
        </div>
      )}

      {/* Media Player — full-width on mobile */}
      <div className="-mx-4 md:mx-0">
        <AudioPlayer
          audioUrl={shiur.audio_url}
          mediaType={effectiveMediaType}
          posterUrl={shiur.image_url || (isVideo ? undefined : '/temp-shiur-image.jpg')}
          title={shiur.title}
          shiurId={shiur.id}
          allowDownload={shiur.allow_download}
          timestamps={shiur.timestamps}
        />
      </div>

      {/* Title, Views, Actions, Description — below the player */}
      {!isEditing && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl md:text-4xl font-bold text-custom-accent tracking-tight">{shiur.title}</h1>
              {viewCount !== null && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Eye size={14} />
                  {viewCount} {viewCount === 1 ? 'view' : 'views'}
                </span>
              )}
            </div>
            <div className="flex flex-row items-center gap-3 flex-shrink-0 mt-1">
              {isAdmin && (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {new Date(shiur.created_at).toLocaleDateString()}
                </span>
              )}
              <button
                onClick={handleShare}
                className="text-gray-400 hover:text-custom-accent transition"
                title="Share"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handleLike}
                className={`flex flex-row items-center gap-1.5 transition ${hasLiked ? 'text-red-500 hover:text-gray-400' : 'text-gray-400 hover:text-red-400'} ${likeAnimating ? 'scale-125' : 'scale-100'} transition-transform duration-200`}
              >
                <Heart size={22} fill={hasLiked ? 'currentColor' : 'none'} />
                {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
              </button>
            </div>
          </div>
          {shiur.description && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {shiur.description}
            </p>
          )}
        </div>
      )}

      {/* Timestamps */}
      {shiur.timestamps && shiur.timestamps.length > 0 && (
        <TimestampsList
          timestamps={shiur.timestamps}
          onTimestampClick={handleTimestampClick}
        />
      )}

      {/* Tags - Display Mode */}
      {!isEditing && shiur.tags && shiur.tags.length > 0 && (
        <div className="flex flex-col gap-2 p-4 md:p-6 rounded-2xl bg-gray-50">
          <h3 className="text-lg font-semibold text-custom-accent flex flex-row items-center gap-2">
            <Tag size={20} />
            Tags
          </h3>
          <div className="flex flex-row gap-2 flex-wrap">
            {shiur.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded text-sm"
              >
                <Tag size={14} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}


      {/* Transcript */}
      {shiur.transcript && !isEditing && (
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-custom-accent">Transcript</h2>
          <div className="bg-gray-50 p-4 md:p-6 rounded-2xl text-sm text-gray-700 whitespace-pre-wrap">
            {shiur.transcript}
          </div>
        </div>
      )}

      {/* Popular Shiurim */}
      {!isEditing && (
        <div className="pt-4 border-t border-gray-100">
          <PopularShiurim excludeId={shiur.id} />
        </div>
      )}
    </div>
  );
}
