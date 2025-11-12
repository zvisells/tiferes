'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Shiur } from '@/lib/types';
import AdminForm from '@/components/AdminForm';
import AdminTabs from '@/components/AdminTabs';
import { Edit2, Trash2, Music, FileText, Calendar } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [shiurim, setShiurim] = useState<Shiur[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('shiurim');

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
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const tags = (formData.get('tags') as string).split(',').map((t) => t.trim());
      const timestamps = JSON.parse(formData.get('timestamps') as string);
      const allowDownload = formData.get('allowDownload') === 'true';
      const imageFile = formData.get('image') as File | null;
      const audioFile = formData.get('audio') as File | null;

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

      await fetchShiurim();
      alert('Shiur uploaded successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const tabs = [
    { id: 'shiurim', label: 'Shiurim', icon: <Music size={18} /> },
    { id: 'pages', label: 'Pages', icon: <FileText size={18} /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar size={18} /> },
  ];

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-6xl mx-auto py-8">
        {/* Tabs */}
        <AdminTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Shiurim Tab */}
        {activeTab === 'shiurim' && (
          <>
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
          </>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-custom-accent">Pages (Coming Soon)</h2>
            <p className="text-gray-600">Page editing will be available soon.</p>
          </section>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-custom-accent">Next Discourse Schedule</h2>
            <p className="text-gray-600">Schedule management will be available soon.</p>
          </section>
        )}
    </div>
  );
}
