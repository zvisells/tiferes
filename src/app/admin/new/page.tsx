'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AdminForm from '@/components/AdminForm';

export default function NewShiurPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

      // Helper to upload file via presigned URL (bypasses Vercel limits)
      const uploadWithPresignedUrl = async (file: File, fileType: string): Promise<string> => {
        try {
          // Step 1: Request presigned URL from backend (tiny request)
          const response = await fetch(
            `/api/upload?filename=${encodeURIComponent(file.name)}&fileType=${fileType}`
          );
          if (!response.ok) {
            throw new Error(`Failed to get presigned URL: ${response.statusText}`);
          }
          const { presignedUrl, publicUrl } = await response.json();

          // Step 2: Upload directly to R2 using presigned URL
          const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
          });

          if (!uploadResponse.ok) {
            throw new Error(`R2 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
          }

          return publicUrl;
        } catch (error) {
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

      setToast({ message: 'Shiur created successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToast({ message: `Failed: ${errorMessage}`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-2xl mx-auto py-8">
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

      <h1 className="text-4xl font-bold text-custom-accent">Create New Shiur</h1>
      <AdminForm onSubmit={handleFormSubmit} isLoading={uploading} />
    </div>
  );
}

