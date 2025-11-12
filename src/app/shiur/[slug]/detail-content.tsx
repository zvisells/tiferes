'use client';

import React, { useState, useEffect } from 'react';
import { Shiur } from '@/lib/types';
import AudioPlayer from '@/components/AudioPlayer';
import TimestampsList from '@/components/TimestampsList';
import { supabase } from '@/lib/supabaseClient';
import { Tag, Edit2, Check, X } from 'lucide-react';

export default function ShiurDetailContent({ shiur: initialShiur }: { shiur: Shiur }) {
  const [shiur, setShiur] = useState(initialShiur);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    title: initialShiur.title,
    description: initialShiur.description || '',
    tags: initialShiur.tags.join(', '),
    allow_download: initialShiur.allow_download,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };
    checkAdmin();
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

      // Upload new audio file if provided
      if (audioFile) {
        const audioFormData = new FormData();
        audioFormData.append('file', audioFile);
        audioFormData.append('fileType', 'audio');
        const audioRes = await fetch('/api/upload', {
          method: 'POST',
          body: audioFormData,
        });
        if (audioRes.ok) {
          const audioData = await audioRes.json();
          updateData.audio_url = audioData.url;
        }
      }

      // Upload new image file if provided
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        imageFormData.append('fileType', 'image');
        const imageRes = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });
        if (imageRes.ok) {
          const imageData = await imageRes.json();
          updateData.image_url = imageData.url;
        }
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
      alert('Shiur updated successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
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

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-4xl mx-auto py-8">
      {/* Edit Mode Toggle */}
      {isAdmin && (
        <div className="flex flex-row gap-2 items-center">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex flex-row items-center gap-2"
            >
              <Edit2 size={18} />
              Edit
            </button>
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
        </div>
      )}

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
