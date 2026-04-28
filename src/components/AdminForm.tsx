'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { TimestampTopic, MediaType, detectMediaType } from '@/lib/types';
import { getParshiaList } from '@/lib/parshiot';
import DropZone from './DropZone';

interface AdminFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
  uploadProgress?: number;
}

interface FormState {
  title: string;
  description: string;
  tags: string;
  parsha: string;
  allowDownload: boolean;
  timestamps: TimestampTopic[];
}

export default function AdminForm({ onSubmit, isLoading = false, uploadProgress = 0 }: AdminFormProps) {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    description: '',
    tags: '',
    parsha: '',
    allowDownload: false,
    timestamps: [],
  });
  const parshiot = getParshiaList();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('audio');
  const [newTopic, setNewTopic] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const handleMediaFileChange = (file: File | null) => {
    setMediaFile(file);
    if (file) setMediaType(detectMediaType(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!mediaFile) {
      alert('Please select an audio or video file');
      return;
    }

    const formData = new FormData();
    formData.append('title', formState.title);
    formData.append('description', formState.description);
    formData.append('tags', formState.tags);
    formData.append('parsha', formState.parsha);
    formData.append('allowDownload', String(formState.allowDownload));
    formData.append('timestamps', JSON.stringify(formState.timestamps));
    formData.append('audio', mediaFile);
    formData.append('mediaType', mediaType);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await onSubmit(formData);
      setFormState({
        title: '',
        description: '',
        tags: '',
        parsha: '',
        allowDownload: false,
        timestamps: [],
      });
      setImageFile(null);
      setMediaFile(null);
      setMediaType('audio');
      alert('Shiur uploaded successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Upload Zones — side by side, media first */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Audio / Video *
          </label>
          <DropZone
            accept="audio/*,video/*"
            label="Drop media file here"
            sublabel="or click to browse"
            icon="media"
            file={mediaFile}
            onFileChange={handleMediaFileChange}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Cover Image <span className="normal-case font-normal text-gray-400">(optional)</span>
          </label>
          <DropZone
            accept="image/*"
            label="Drop image here"
            sublabel="or click to browse"
            icon="image"
            file={imageFile}
            onFileChange={setImageFile}
          />
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title *</label>
        <input
          type="text"
          name="title"
          value={formState.title}
          onChange={handleFormChange}
          placeholder="Enter shiur title"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent text-sm"
          required
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
        <textarea
          name="description"
          value={formState.description}
          onChange={handleFormChange}
          placeholder="Enter shiur description"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent text-sm min-h-24 resize-y"
        />
      </div>

      {/* Tags + Parsha — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</label>
          <input
            type="text"
            name="tags"
            value={formState.tags}
            onChange={handleFormChange}
            placeholder="Torah, Ethics, Spirituality"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parsha</label>
          <select
            name="parsha"
            value={formState.parsha}
            onChange={handleFormChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent text-sm bg-white"
          >
            <option value="">Select a Parsha...</option>
            {parshiot.map((parsha) => (
              <option key={parsha} value={parsha.replace(/\*\*/g, '')}>
                {parsha.includes('**') ? parsha.replace(/\*\*/g, '') + ' 📖' : parsha}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Topics & Timestamps</label>
        {formState.timestamps.length > 0 && (
          <div className="flex flex-col gap-2">
            {formState.timestamps.map((ts, idx) => (
              <div
                key={idx}
                className="flex flex-row items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200"
              >
                <span className="text-xs bg-custom-accent/10 text-custom-accent px-2 py-1 rounded font-mono">
                  {ts.time}
                </span>
                <span className="flex-1 text-sm">{ts.topic}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTimestamp(idx)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-row gap-2 items-center">
          <input
            type="text"
            placeholder="HH:MM:SS"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="w-24 px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent text-sm font-mono text-center"
          />
          <input
            type="text"
            placeholder="Topic name"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-accent text-sm"
          />
          <button
            type="button"
            onClick={handleAddTimestamp}
            className="p-2.5 rounded-lg bg-custom-accent text-white hover:opacity-90 transition flex-shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Allow Download */}
      <label className="flex flex-row items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            name="allowDownload"
            checked={formState.allowDownload}
            onChange={handleFormChange}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-gray-200 peer-checked:bg-custom-accent rounded-full transition-colors" />
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
        </div>
        <span className="text-sm text-gray-700">Allow users to download media</span>
      </label>

      {/* Submit Button with Progress */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-lg bg-custom-accent text-white font-semibold hover:opacity-90 transition relative overflow-hidden disabled:opacity-70"
      >
        {isLoading && uploadProgress > 0 && (
          <div
            className="absolute inset-0 bg-white/20 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        )}
        <span className="relative z-10">
          {isLoading ? `Uploading... ${uploadProgress > 0 ? `${uploadProgress}%` : ''}` : 'Upload Shiur'}
        </span>
      </button>
    </form>
  );
}
