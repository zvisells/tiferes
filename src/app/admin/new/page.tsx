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

      // Helper function to upload file directly to R2
      const uploadToR2 = async (file: File, fileType: string): Promise<string> => {
        try {
          console.log(`📤 Uploading ${fileType}:`, file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

          // Step 1: Get credentials from backend
          const credRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileType: fileType,
              contentType: file.type || 'application/octet-stream',
            }),
          });

          if (!credRes.ok) {
            throw new Error(`Failed to get upload credentials: ${credRes.statusText}`);
          }

          const { publicUrl, uploadUrl, accessKeyId, key, bucket } = await credRes.json();
          console.log(`🔑 Got credentials for key:`, key);

          // Step 2: Upload directly to R2 (bypasses Vercel limits!)
          console.log(`🚀 Uploading directly to R2...`);
          const r2Response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
          });

          if (!r2Response.ok) {
            throw new Error(`R2 upload failed: ${r2Response.statusText}`);
          }

          console.log(`✅ ${fileType} uploaded successfully to R2:`, publicUrl);
          return publicUrl;
        } catch (error) {
          console.error(`❌ Failed to upload ${fileType}:`, error);
          throw error;
        }
      };

      // Upload image if provided
      if (imageFile) {
        try {
          imageUrl = await uploadToR2(imageFile, 'image');
        } catch (error) {
          console.warn('Image upload failed, continuing without image:', error);
        }
      }

      // Upload audio (required)
      if (audioFile) {
        audioUrl = await uploadToR2(audioFile, 'audio');
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

