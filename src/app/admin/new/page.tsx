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

      // Helper to upload file directly to R2 (bypasses Vercel limits)
      const uploadDirectToR2 = async (file: File, fileType: string): Promise<string> => {
        try {
          console.log(`📤 Uploading ${fileType}:`, file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

          // Step 1: Get R2 credentials from backend (tiny request, <1KB)
          const credRes = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&fileType=${fileType}`);
          if (!credRes.ok) {
            throw new Error(`Failed to get R2 credentials: ${credRes.statusText}`);
          }
          const creds = await credRes.json();
          console.log(`🔑 Got R2 credentials for ${fileType}`);

          // Step 2: Generate AWS S3 signature for direct upload
          const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
          const dateStamp = date.substr(0, 8);
          const region = 'auto';
          const service = 's3';

          // Create canonical request
          const canonicalUri = `/${creds.bucket}/${creds.key}`;
          const canonicalQuerystring = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${creds.accessKeyId}%2F${dateStamp}%2F${region}%2F${service}%2Faws4_request&X-Amz-Date=${date}&X-Amz-Expires=3600&X-Amz-SignedHeaders=host`;
          const canonicalHeaders = `host:${creds.accountId}.r2.cloudflarestorage.com\n`;
          const payloadHash = 'UNSIGNED-PAYLOAD';
          const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\nhost\n${payloadHash}`;

          // Create signature
          const signature = await createAwsSignature(canonicalRequest, creds.secretAccessKey, dateStamp, region, service);

          // Step 3: Upload directly to R2 with proper AWS auth headers
          console.log(`🚀 Uploading directly to R2...`);
          const signedUrl = `${creds.uploadUrl}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${encodeURIComponent(creds.accessKeyId + '/' + dateStamp + '/' + region + '/' + service + '/aws4_request')}&X-Amz-Date=${date}&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=${signature}`;

          const r2Response = await fetch(signedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
          });

          if (!r2Response.ok) {
            throw new Error(`R2 upload failed: ${r2Response.status} ${r2Response.statusText}`);
          }

          console.log(`✅ ${fileType} uploaded successfully:`, creds.publicUrl);
          return creds.publicUrl;
        } catch (error) {
          console.error(`❌ Failed to upload ${fileType}:`, error);
          throw error;
        }
      };

      // AWS signature helper functions
      const createAwsSignature = async (canonicalRequest: string, secretKey: string, dateStamp: string, region: string, service: string): Promise<string> => {
        const stringToSign = `AWS4-HMAC-SHA256\n${new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')}\n${dateStamp}/${region}/${service}/aws4_request\n${await sha256(canonicalRequest)}`;

        const kDate = await hmac('AWS4' + secretKey, dateStamp);
        const kRegion = await hmac(kDate, region);
        const kService = await hmac(kRegion, service);
        const kSigning = await hmac(kService, 'aws4_request');

        return bytesToHex(await hmac(kSigning, stringToSign));
      };

      const sha256 = async (message: string): Promise<string> => {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        return bytesToHex(new Uint8Array(hashBuffer));
      };

      const hmac = async (key: string | ArrayBuffer, message: string): Promise<ArrayBuffer> => {
        let keyBuffer: ArrayBuffer;
        if (typeof key === 'string') {
          keyBuffer = new TextEncoder().encode(key);
        } else {
          keyBuffer = key;
        }
        const messageBuffer = new TextEncoder().encode(message);
        const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        return crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
      };

      const bytesToHex = (bytes: Uint8Array): string => {
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      };

      // Upload image if provided
      if (imageFile) {
        try {
          imageUrl = await uploadDirectToR2(imageFile, 'image');
        } catch (error) {
          console.warn('Image upload failed, continuing without image:', error);
        }
      }

      // Upload audio (required)
      if (audioFile) {
        audioUrl = await uploadDirectToR2(audioFile, 'audio');
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

