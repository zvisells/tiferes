'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AdminForm from '@/components/AdminForm';

export default function NewShiurPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

      // Helper to upload file via presigned URL with progress tracking (bypasses Vercel limits)
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

          // Step 2: Upload directly to R2 using XMLHttpRequest for progress tracking
          return new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percentComplete);
              }
            });

            // Handle completion
            xhr.addEventListener('load', () => {
              if (xhr.status === 200) {
                setUploadProgress(0);
                resolve(publicUrl);
              } else {
                setUploadProgress(0);
                reject(new Error(`R2 upload failed: ${xhr.status} ${xhr.statusText}`));
              }
            });

            // Handle errors
            xhr.addEventListener('error', () => {
              setUploadProgress(0);
              reject(new Error('Upload failed: network error'));
            });

            xhr.addEventListener('abort', () => {
              setUploadProgress(0);
              reject(new Error('Upload cancelled'));
            });

            // Set up and send request
            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
            xhr.send(file);
          });
        } catch (error) {
          setUploadProgress(0);
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

      {/* Upload Progress Bar */}
      {uploading && uploadProgress > 0 && (
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

      <h1 className="text-4xl font-bold text-custom-accent">Create New Shiur</h1>
      <AdminForm onSubmit={handleFormSubmit} isLoading={uploading} />
    </div>
  );
}

