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

      // Helper to upload file using presigned URL (bypasses Vercel size limits)
      const uploadWithPresignedUrl = async (file: File, fileType: string): Promise<string> => {
        try {
          console.log(`📤 Uploading ${fileType}:`, file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

          // Step 1: Get presigned URL from backend (tiny request, <1KB)
          const presignRes = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&fileType=${fileType}`);
          if (!presignRes.ok) {
            throw new Error(`Failed to get presigned URL: ${presignRes.statusText}`);
          }
          const { presignedUrl, publicUrl } = await presignRes.json();
          console.log(`🔑 Got presigned URL for ${fileType}`);

          // Step 2: Upload directly to R2 using presigned URL (bypasses Vercel entirely!)
          console.log(`🚀 Uploading directly to R2...`);
          const r2Response = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
          });

          if (!r2Response.ok) {
            throw new Error(`R2 upload failed: ${r2Response.statusText}`);
          }

          console.log(`✅ ${fileType} uploaded successfully:`, publicUrl);
          return publicUrl;
        } catch (error) {
          console.error(`❌ Failed to upload ${fileType}:`, error);
          throw error;
        }
      };

      // Upload image if provided
      if (imageFile) {
        try {
          imageUrl = await uploadWithPresignedUrl(imageFile, 'image');
        } catch (error) {
          console.warn('Image upload failed, continuing without image:', error);
        }
      }

      // Upload audio (required)
      if (audioFile) {
        audioUrl = await uploadWithPresignedUrl(audioFile, 'audio');
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

