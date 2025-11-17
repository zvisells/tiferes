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

      // Upload files using FormData POST with AWS SDK (worked for 90MB file)
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

        // Try multiple times with increasing delays (network issues)
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          try {
            console.log(`🚀 Upload attempt ${attempts + 1}/${maxAttempts}...`);
            const audioRes = await fetch('/api/upload', {
              method: 'POST',
              body: audioFormData,
            });

            if (audioRes.ok) {
              const audioData = await audioRes.json();
              audioUrl = audioData.url;
              console.log('✅ Audio uploaded successfully');
              break;
            } else {
              const errorText = await audioRes.text();
              console.error(`❌ Upload attempt ${attempts + 1} failed:`, audioRes.status, errorText);

              if (attempts === maxAttempts - 1) {
                throw new Error(`Failed to upload audio file: ${audioRes.status}`);
              }

              // Wait before retrying (exponential backoff)
              const delay = Math.pow(2, attempts) * 2000; // 2s, 4s, 8s
              console.log(`⏳ Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          } catch (error) {
            console.error(`❌ Upload attempt ${attempts + 1} error:`, error);

            if (attempts === maxAttempts - 1) {
              throw error;
            }

            const delay = Math.pow(2, attempts) * 2000;
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          attempts++;
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

