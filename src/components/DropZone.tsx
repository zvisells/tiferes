'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Music, Video, X } from 'lucide-react';

interface DropZoneProps {
  accept: string;
  label: string;
  sublabel?: string;
  icon?: 'image' | 'media';
  file: File | null;
  onFileChange: (file: File | null) => void;
  previewUrl?: string;
  required?: boolean;
}

export default function DropZone({
  accept,
  label,
  sublabel,
  icon = 'media',
  file,
  onFileChange,
  previewUrl,
  required,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  }, [onFileChange]);

  const handleClick = () => inputRef.current?.click();

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isImage = file?.type.startsWith('image/');
  const isVideoFile = file?.type.startsWith('video/');
  const filePreviewUrl = file && isImage ? URL.createObjectURL(file) : null;

  const IconComponent = icon === 'image' ? ImageIcon : Upload;

  if (file) {
    return (
      <div className="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-custom-accent/30 bg-custom-accent/5 min-h-[160px] justify-center">
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-500 transition"
        >
          <X size={14} />
        </button>

        {filePreviewUrl ? (
          <img src={filePreviewUrl} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
        ) : previewUrl && icon === 'image' ? (
          <img src={previewUrl} alt="Current" className="w-full h-24 object-cover rounded-lg opacity-60" />
        ) : (
          <div className="p-3 rounded-full bg-custom-accent/10">
            {isVideoFile ? <Video size={24} className="text-custom-accent" /> : <Music size={24} className="text-custom-accent" />}
          </div>
        )}

        <p className="text-xs text-custom-accent font-medium text-center truncate w-full">{file.name}</p>
        <p className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[160px] ${
        isDragging
          ? 'border-custom-accent bg-custom-accent/5'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50'
      }`}
    >
      {previewUrl && icon === 'image' ? (
        <img src={previewUrl} alt="Current" className="w-full h-20 object-cover rounded-lg opacity-40 mb-1" />
      ) : (
        <div className={`p-3 rounded-full ${isDragging ? 'bg-custom-accent/10' : 'bg-gray-100'}`}>
          <IconComponent size={24} className={isDragging ? 'text-custom-accent' : 'text-gray-400'} />
        </div>
      )}

      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        required={required}
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        className="hidden"
      />
    </div>
  );
}
