'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AdminForm from '@/components/AdminForm';

export default function NewShiurPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/admin');
      }
    };
    checkAuth();
  }, [router]);

  const handleFormSubmit = async (formData: FormData) => {
    setUploading(true);
    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const tags = (formData.get('tags') as string).split(',').map((t) => t.trim());
      const timestamps = JSON.parse(formData.get('timestamps') as string);
      const allowDownload = formData.get('allowDownload') === 'true';
      const imageFile = formData.get('image') as File | null;
      const audioFile = formData.get('audio') as File | null;

      let imageUrl: string | null = null;
      let audioUrl: string | null = null;

      // Upload files using FormData POST (works with AWS SDK on backend)
      if (imageFile) {
        try {
          const imgFormData = new FormData();
          imgFormData.append('file', imageFile);
          imgFormData.append('fileType', 'image');
          const imgRes = await fetch('/api/upload', {
            method: 'POST',
            body: imgFormData,
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            imageUrl = imgData.url;
          }
        } catch (error) {
          console.warn('Image upload failed, continuing without image:', error);
        }
      }

      if (audioFile) {
        console.log(`📤 Uploading audio: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`);
        const audioFormData = new FormData();
        audioFormData.append('file', audioFile);
        audioFormData.append('fileType', 'audio');
        const audioRes = await fetch('/api/upload', {
          method: 'POST',
          body: audioFormData,
        });
        if (audioRes.ok) {
          const audioData = await audioRes.json();
          audioUrl = audioData.url;
          console.log('✅ Audio uploaded successfully');
        } else {
          const errorText = await audioRes.text();
          console.error('Upload failed:', audioRes.status, errorText);
          throw new Error(`Failed to upload audio file: ${audioRes.status}`);
        }
      } else {
        throw new Error('Audio file is required');
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { data, error } = await supabase
        .from('shiurim')
        .insert([
          {
            slug,
            title,
            description,
            tags,
            image_url: imageUrl,
            audio_url: audioUrl,
            timestamps,
            allow_download: allowDownload,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      alert('Shiur created successfully!');
      router.push('/');
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-2xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-custom-accent">Create New Shiur</h1>
      <AdminForm onSubmit={handleFormSubmit} isLoading={uploading} />
    </div>
  );
}

