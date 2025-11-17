'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { TimestampTopic } from '@/lib/types';

interface AdminFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
  uploadProgress?: number;
}

interface FormState {
  title: string;
  description: string;
  tags: string;
  allowDownload: boolean;
  timestamps: TimestampTopic[];
}

export default function AdminForm({ onSubmit, isLoading = false, uploadProgress = 0 }: AdminFormProps) {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    tags: '',
    allowDownload: false,
    timestamps: [],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setFormState((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTimestamp = () => {
    if (newTopic && newTime) {
      setFormState((prev) => ({
        ...prev,
        timestamps: [...prev.timestamps, { topic: newTopic, time: newTime }],
      }));
      setNewTopic('');
      setNewTime('');
    }
  };

  const handleRemoveTimestamp = (idx: number) => {
    setFormState((prev) => ({
      ...prev,
      timestamps: prev.timestamps.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formState.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!audioFile) {
      alert('Please select an audio file');
      return;
    }

    const formData = new FormData();
    formData.append('title', formState.title);
    formData.append('description', formState.description);
    formData.append('tags', formState.tags);
    formData.append('allowDownload', String(formState.allowDownload));
    formData.append('timestamps', JSON.stringify(formState.timestamps));
    formData.append('audio', audioFile);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await onSubmit(formData);
      // Reset form
      setFormState({
        title: '',
        description: '',
        tags: '',
        allowDownload: false,
        timestamps: [],
      });
      setImageFile(null);
      setAudioFile(null);
      alert('Shiur uploaded successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-upload-form">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Title *</label>
        <input
          type="text"
          name="title"
          value={formState.title}
          onChange={handleFormChange}
          placeholder="Enter shiur title"
          className="search-input"
          required
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Description</label>
        <textarea
          name="description"
          value={formState.description}
          onChange={handleFormChange}
          placeholder="Enter shiur description"
          className="search-input min-h-24"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Tags (comma-separated)</label>
        <input
          type="text"
          name="tags"
          value={formState.tags}
          onChange={handleFormChange}
          placeholder="e.g., Torah, Ethics, Spirituality"
          className="search-input"
        />
      </div>

      {/* Image Upload */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="search-input"
        />
      </div>

      {/* Audio Upload */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Audio File *</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            console.log('Audio file selected:', file?.name, file?.size);
            setAudioFile(file || null);
          }}
          className="search-input"
          required
        />
        {audioFile && (
          <p className="text-xs text-green-600">
            ✓ Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Timestamps */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm">Topics & Timestamps</label>
        <div className="flex flex-col gap-2">
          {formState.timestamps.map((ts, idx) => (
            <div
              key={idx}
              className="flex flex-row items-center gap-2 p-2 bg-white rounded border border-gray-300"
            >
              <span className="flex-1">{ts.topic}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {ts.time}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveTimestamp(idx)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Timestamp */}
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="search-input flex-1"
          />
          <input
            type="text"
            placeholder="HH:MM:SS"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="search-input w-24"
          />
          <button
            type="button"
            onClick={handleAddTimestamp}
            className="btn-primary flex flex-row items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Allow Download */}
      <div className="flex flex-row items-center gap-2">
        <input
          type="checkbox"
          name="allowDownload"
          checked={formState.allowDownload}
          onChange={handleFormChange}
          className="w-4 h-4"
        />
        <label className="text-sm">Allow users to download audio</label>
      </div>

      {/* Submit Button with Progress */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full relative overflow-hidden"
      >
        {/* Progress bar background */}
        {isLoading && uploadProgress > 0 && (
          <div
            className="absolute inset-0 bg-custom-accent/30 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        )}
        {/* Button text */}
        <span className="relative z-10">
          {isLoading ? `Uploading... ${uploadProgress > 0 ? `${uploadProgress}%` : ''}` : 'Upload Shiur'}
        </span>
      </button>
    </form>
  );
}

