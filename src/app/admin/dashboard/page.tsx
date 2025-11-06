'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Shiur } from '@/lib/types';
import AdminForm from '@/components/AdminForm';
import { Edit2, Trash2, LogOut } from 'lucide-react';
import { logoutAdmin } from '@/lib/auth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [shiurim, setShiurim] = useState<Shiur[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/admin');
      }
    };

    checkAuth();
    fetchShiurim();
  }, [router]);

  const fetchShiurim = async () => {
    try {
      const { data, error } = await supabase
        .from('shiurim')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShiurim(data || []);
    } catch (error) {
      console.error('Error fetching shiurim:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    setUploading(true);
    try {
      // Extract form data
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const tags = (formData.get('tags') as string).split(',').map((t) => t.trim());
      const timestamps = JSON.parse(formData.get('timestamps') as string);
      const allowDownload = formData.get('allowDownload') === 'true';
      const imageFile = formData.get('image') as File | null;
      const audioFile = formData.get('audio') as File | null;

      // Upload files to Cloudflare R2
      let imageUrl: string | null = null;
      let audioUrl: string | null = null;

      if (imageFile) {
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
      }

      if (audioFile) {
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
        } else {
          throw new Error('Failed to upload audio file');
        }
      } else {
        throw new Error('Audio file is required');
      }

      // Generate slug
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Insert into Supabase
      const { data, error } = await supabase
        .from('shiurim')
        .insert([
          {
            slug,
            title,
            description,
            tags,
            image_url: imageUrl,
            audio_url: audioUrl || 'https://example.com/audio.mp3',
            timestamps,
            allow_download: allowDownload,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      // Refresh list
      await fetchShiurim();
      alert('Shiur uploaded successfully!');
    } catch (error) {
      console.error('Error uploading shiur:', error);
      alert('Failed to upload shiur. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shiur?')) return;

    try {
      const { error } = await supabase
        .from('shiurim')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchShiurim();
    } catch (error) {
      console.error('Error deleting shiur:', error);
      alert('Failed to delete shiur.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-4xl font-bold text-custom-accent">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="btn-secondary flex flex-row items-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Upload Form */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-custom-accent">Upload New Shiur</h2>
        <AdminForm onSubmit={handleFormSubmit} isLoading={uploading} />
      </section>

      {/* Shiurim List */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-custom-accent">Existing Shiurim</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : shiurim.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-300">
                <tr>
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">Tags</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-center p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shiurim.map((shiur) => (
                  <tr key={shiur.id} className="border-b border-gray-200">
                    <td className="p-4 font-medium">{shiur.title}</td>
                    <td className="p-4 text-xs">
                      {shiur.tags.join(', ')}
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(shiur.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-row gap-2 justify-center">
                        <button className="text-blue-500 hover:text-blue-700">
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(shiur.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No shiurim yet. Upload your first one above.
          </div>
        )}
      </section>
    </div>
  );
}

