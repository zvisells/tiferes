'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shiur } from '@/lib/types';
import AudioPlayer from '@/components/AudioPlayer';
import TimestampsList from '@/components/TimestampsList';
import TimestampPicker from '@/components/TimestampPicker';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Tag, Edit2, Check, X, Heart, Trash2 } from 'lucide-react';

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
    allow_download: initialShiur.allow_download,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [editedTimestamps, setEditedTimestamps] = useState(
    initialShiur.timestamps || []
  );
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    const audioElement = document.querySelector('audio');
    if (!audioElement) return;

    const updateTime = () => {
      setCurrentTime(audioElement.currentTime);
    };

    audioElement.addEventListener('timeupdate', updateTime);
    return () => audioElement.removeEventListener('timeupdate', updateTime);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const tags = editedData.tags.split(',').map((t) => t.trim());
      const updateData: any = {
        title: editedData.title,
        description: editedData.description,
        tags,
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
      if (audioFile) {
        try {
          const audioUrl = await uploadWithProgress(audioFile, 'audio');
          updateData.audio_url = audioUrl;
        } catch (error) {
          console.error('Audio upload failed:', error);
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
      setAudioFile(null);
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
      allow_download: shiur.allow_download,
    });
    setImageFile(null);
    setAudioFile(null);
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

    const audioElements = document.querySelectorAll('audio');
    if (audioElements.length > 0) {
      audioElements[0].currentTime = seconds;
      audioElements[0].play();
    }
  };

  const handleAddTimestamp = (time: string, topic: string) => {
    setEditedTimestamps([...editedTimestamps, { time, topic }]);
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-4xl mx-auto py-8">
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

      {/* Upload Progress Bar */}
      {isSaving && uploadProgress > 0 && (
        <div className="fixed top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 z-50">
          <div className="flex flex-row items-center gap-3">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-custom-accent h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-custom-accent min-w-fit">
              {uploadProgress}%
            </span>
          </div>
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
                    className="btn-primary flex flex-row items-center gap-2"
                  >
                    <Check size={18} />
                    {isSaving ? 'Saving...' : 'Save'}
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

        {/* Sponsor Button */}
        <a
          href="https://abcharity.org/Yehadis"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex flex-row items-center gap-2"
        >
          <Heart size={18} />
          Sponsor a Shiur
        </a>
      </div>

      {/* Title */}
      {isEditing ? (
        <input
          type="text"
          value={editedData.title}
          onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
          className="text-4xl font-bold text-custom-accent search-input"
        />
      ) : (
        <h1 className="text-4xl font-bold text-custom-accent">{shiur.title}</h1>
      )}

      {/* Meta Info */}
      {!isEditing && (
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
      )}

      {/* Tags (Edit Mode) */}
      {isEditing && (
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Tags (comma-separated)</label>
          <input
            type="text"
            value={editedData.tags}
            onChange={(e) => setEditedData({ ...editedData, tags: e.target.value })}
            className="search-input"
          />
        </div>
      )}

      {/* Image */}
      {!isEditing && shiur.image_url && (
        <div className="w-full h-64 md:h-96 bg-gray-200 rounded-2xl overflow-hidden">
          <img
            src={shiur.image_url}
            alt={shiur.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Image Upload (Edit Mode) */}
      {isEditing && (
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Image (optional - to replace)</label>
          {shiur.image_url && (
            <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-2">
              <img
                src={shiur.image_url}
                alt={shiur.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="search-input"
          />
          {imageFile && <p className="text-xs text-green-600">✓ {imageFile.name}</p>}
        </div>
      )}

      {/* Audio Upload (Edit Mode) */}
      {isEditing && (
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Audio File (optional - to replace)</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="search-input"
          />
          {audioFile && <p className="text-xs text-green-600">✓ {audioFile.name}</p>}
        </div>
      )}

      {/* Download Toggle (Edit Mode) */}
      {isEditing && (
        <div className="flex flex-row items-center gap-2">
          <input
            type="checkbox"
            id="allowDownload"
            checked={editedData.allow_download}
            onChange={(e) =>
              setEditedData((prev) => ({
                ...prev,
                allow_download: e.target.checked,
              }))
            }
            className="w-4 h-4"
          />
          <label htmlFor="allowDownload" className="text-sm">
            Allow users to download audio
          </label>
        </div>
      )}

      {/* Timestamps Editing (Edit Mode) */}
      {isEditing && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <label className="font-semibold text-sm">Timestamps</label>
            <TimestampPicker currentTime={currentTime} onAdd={handleAddTimestamp} />
          </div>
          <div className="flex flex-col gap-2">
            {editedTimestamps.map((ts, idx) => (
              <div key={idx} className="flex flex-row gap-2 items-center">
                <input
                  type="text"
                  value={ts.time}
                  onChange={(e) => {
                    const updated = [...editedTimestamps];
                    updated[idx].time = e.target.value;
                    setEditedTimestamps(updated);
                  }}
                  placeholder="HH:MM:SS"
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  value={ts.topic}
                  onChange={(e) => {
                    const updated = [...editedTimestamps];
                    updated[idx].topic = e.target.value;
                    setEditedTimestamps(updated);
                  }}
                  placeholder="Topic"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => {
                    setEditedTimestamps(
                      editedTimestamps.filter((_, i) => i !== idx)
                    );
                  }}
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
            {editedTimestamps.length === 0 && (
              <p className="text-xs text-gray-500">No timestamps yet</p>
            )}
          </div>
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
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Description</label>
          <textarea
            value={editedData.description}
            onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
            className="search-input min-h-32"
          />
        </div>
      ) : (
        shiur.description && (
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-custom-accent">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {shiur.description}
            </p>
          </div>
        )
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
    </div>
  );
}
