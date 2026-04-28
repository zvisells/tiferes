'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AdminForm from '@/components/AdminForm';
import AdminTabNav from '@/components/AdminTabNav';
import { MediaType, detectMediaType } from '@/lib/types';

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
      // Check authentication state
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔵 Current auth session:', sessionData.session ? 'Authenticated' : 'Not authenticated');
      console.log('🔵 Current domain:', typeof window !== 'undefined' ? window.location.hostname : 'server');
      
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const tags = (formData.get('tags') as string).split(',').map((t) => t.trim()).filter(t => t);
      const parsha = formData.get('parsha') as string;
      const timestamps = JSON.parse(formData.get('timestamps') as string);
      const allowDownload = formData.get('allowDownload') === 'true';
      const imageFile = formData.get('image') as File | null;
      const audioFile = formData.get('audio') as File | null;
      const mediaType = (formData.get('mediaType') as MediaType) || 
        (audioFile ? detectMediaType(audioFile) : 'audio');

      let imageUrl: string | null = null;
      let audioUrl: string | null = null;

      // Helper to upload file via presigned URL with progress tracking (bypasses Vercel limits)
      const uploadViaServer = async (file: File, fileType: string): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Server upload failed');
        }
        const data = await res.json();
        return data.url;
      };

      const uploadWithPresignedUrl = async (file: File, fileType: string): Promise<string> => {
        try {
          const response = await fetch(
            `/api/upload?filename=${encodeURIComponent(file.name)}&fileType=${fileType}`
          );
          if (!response.ok) {
            throw new Error(`Failed to get presigned URL: ${response.statusText}`);
          }
          const { presignedUrl, publicUrl } = await response.json();

          return new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percentComplete);
              }
            });

            xhr.addEventListener('load', () => {
              if (xhr.status === 200) {
                setUploadProgress(0);
                resolve(publicUrl);
              } else {
                setUploadProgress(0);
                reject(new Error(`R2 upload failed: ${xhr.status} ${xhr.statusText}`));
              }
            });

            xhr.addEventListener('error', () => {
              setUploadProgress(0);
              reject(new Error('Upload failed: network error'));
            });

            xhr.addEventListener('abort', () => {
              setUploadProgress(0);
              reject(new Error('Upload cancelled'));
            });

            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
            xhr.send(file);
          });
        } catch (error) {
          setUploadProgress(0);
          throw error;
        }
      };

      const uploadFile = async (file: File, fileType: string): Promise<string> => {
        try {
          return await uploadWithPresignedUrl(file, fileType);
        } catch {
          return await uploadViaServer(file, fileType);
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
        const uploadFolder = mediaType === 'video' ? 'video' : 'audio';
        audioUrl = await uploadWithPresignedUrl(audioFile, uploadFolder);
      } else {
        throw new Error('Audio or video file is required');
      }

      // Calculate duration from the media file
      const duration = await new Promise<string>((resolve) => {
        const el = mediaType === 'video'
          ? document.createElement('video')
          : new Audio();
        const url = URL.createObjectURL(audioFile!);
        el.src = url;

        const handleMetadata = () => {
          const totalSeconds = Math.floor(el.duration);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          let durationStr = '';
          if (hours > 0) {
            durationStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          } else {
            durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          }

          resolve(durationStr);
          URL.revokeObjectURL(url);
        };

        el.addEventListener('loadedmetadata', handleMetadata);
        el.addEventListener('error', () => {
          resolve('--:--');
          URL.revokeObjectURL(url);
        });
      });

      // Auto-generate thumbnail from video first frame if no image was provided
      if (mediaType === 'video' && !imageFile && audioFile) {
        try {
          const thumbBlob = await new Promise<Blob | null>((resolve) => {
            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            video.preload = 'auto';
            const url = URL.createObjectURL(audioFile);
            video.src = url;

            video.addEventListener('loadeddata', () => {
              video.currentTime = 0.1;
            });

            video.addEventListener('seeked', () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob(
                    (blob) => {
                      URL.revokeObjectURL(url);
                      resolve(blob);
                    },
                    'image/jpeg',
                    0.85
                  );
                } else {
                  URL.revokeObjectURL(url);
                  resolve(null);
                }
              } catch {
                URL.revokeObjectURL(url);
                resolve(null);
              }
            });

            video.addEventListener('error', () => {
              URL.revokeObjectURL(url);
              resolve(null);
            });
          });

          if (thumbBlob) {
            const thumbFile = new File([thumbBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
            imageUrl = await uploadFile(thumbFile, 'image');
            console.log('✅ Auto-generated video thumbnail uploaded');
          }
        } catch (err) {
          console.warn('Could not auto-generate video thumbnail:', err);
        }
      }

      // Generate base slug
      let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if slug exists and append number if needed
      let finalSlug = slug;
      let counter = 1;
      let slugExists = true;

      while (slugExists) {
        const { data: existingShiur } = await supabase
          .from('shiurim')
          .select('slug')
          .eq('slug', finalSlug)
          .maybeSingle();

        if (!existingShiur) {
          slugExists = false;
        } else {
          counter++;
          finalSlug = `${slug}-${counter}`;
        }
      }

      console.log('🔵 Attempting to insert shiur into Supabase...');
      console.log('🔵 Generated unique slug:', finalSlug);
      console.log('Current domain:', window.location.hostname);
      
      const { data, error } = await supabase
        .from('shiurim')
        .insert([
          {
            slug: finalSlug,
            title,
            description,
            tags,
            parsha,
            image_url: imageUrl,
            audio_url: audioUrl,
            media_type: mediaType,
            timestamps,
            allow_download: allowDownload,
            duration,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }
      
      console.log('✅ Supabase insert successful:', data);

      setToast({ message: 'Shiur created successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('❌ Full upload error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToast({ message: `Failed: ${errorMessage}`, type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-4xl mx-auto py-8">
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

      <AdminTabNav />
      <h1 className="text-3xl font-bold text-custom-accent">Create New Shiur</h1>
      <AdminForm onSubmit={handleFormSubmit} isLoading={uploading} uploadProgress={uploadProgress} />
    </div>
  );
}

