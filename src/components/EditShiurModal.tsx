'use client';

import React, { useState } from 'react';
import { Shiur, TimestampTopic } from '@/lib/types';
import { X, Plus } from 'lucide-react';

interface EditShiurModalProps {
  shiur: Shiur;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Shiur>) => Promise<void>;
  isLoading: boolean;
}

export default function EditShiurModal({
  shiur,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: EditShiurModalProps) {
  const [formState, setFormState] = useState({
    title: shiur.title,
    description: shiur.description || '',
    tags: shiur.tags.join(', '),
    timestamps: shiur.timestamps || [],
  });

  const [newTopic, setNewTopic] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    const tags = formState.tags.split(',').map((t) => t.trim());
    await onSave({
      title: formState.title,
      description: formState.description,
      tags,
      timestamps: formState.timestamps,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-custom-accent">Edit Shiur</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Title</label>
            <input
              type="text"
              name="title"
              value={formState.title}
              onChange={handleChange}
              className="search-input"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Description</label>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              className="search-input min-h-20"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formState.tags}
              onChange={handleChange}
              className="search-input"
            />
          </div>

          {/* Timestamps */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Topics & Timestamps</label>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
              {formState.timestamps.map((ts, idx) => (
                <div key={idx} className="flex flex-row items-center gap-2 p-2 bg-gray-100 rounded">
                  <span className="flex-1 text-sm">{ts.topic}</span>
                  <span className="text-xs bg-white px-2 py-1 rounded">{ts.time}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTimestamp(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
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
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-row gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

