'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Page } from '@/lib/types';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    image_url: '',
    button_text: '',
    button_link: '',
    show_in_nav: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/admin');
        return;
      }
      fetchPages();
    };
    checkAdmin();
  }, [router]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        button_text: formData.button_text || null,
        button_link: formData.button_link || null,
        show_in_nav: formData.show_in_nav,
      };

      // Upload image if provided
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        imageFormData.append('fileType', 'image');
        const imageRes = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });
        if (imageRes.ok) {
          const imageData = await imageRes.json();
          updateData.image_url = imageData.url;
        }
      }

      if (editingId) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Create new page
        const { error } = await supabase.from('pages').insert({
          ...updateData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      setFormData({ title: '', slug: '', content: '', image_url: '', button_text: '', button_link: '', show_in_nav: true });
      setImageFile(null);
      setIsCreating(false);
      setEditingId(null);
      fetchPages();
      alert('Page saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase.from('pages').delete().eq('id', id);

      if (error) throw error;
      fetchPages();
      alert('Page deleted successfully!');
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page');
    }
  };

  const handleEdit = (page: Page) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      image_url: page.image_url || '',
      button_text: page.button_text || '',
      button_link: page.button_link || '',
      show_in_nav: page.show_in_nav,
    });
    setEditingId(page.id);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setFormData({ title: '', slug: '', content: '', image_url: '', button_text: '', button_link: '', show_in_nav: true });
    setImageFile(null);
    setIsCreating(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto py-8 flex flex-col gap-8">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-4xl font-bold text-custom-accent">Manage Pages</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex flex-row items-center gap-2"
          >
            <Plus size={18} />
            New Page
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., About Shul"
              className="search-input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., about-shul (URL safe)"
              className="search-input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Main Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="search-input"
            />
            {imageFile && <p className="text-xs text-green-600">✓ {imageFile.name}</p>}
            {formData.image_url && !imageFile && (
              <p className="text-xs text-gray-600">Current image: {formData.image_url}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Page content..."
              className="search-input min-h-48"
            />
          </div>

          <div className="border-t border-gray-300 pt-4 flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-gray-700">Optional Button (Top Right)</h3>
            
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Button Text</label>
              <input
                type="text"
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                placeholder="e.g., Donate Now"
                className="search-input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Button Link</label>
              <input
                type="text"
                value={formData.button_link}
                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                placeholder="e.g., https://example.com"
                className="search-input"
              />
            </div>

            <div className="border-t border-gray-300 pt-4 flex flex-row items-center gap-2">
              <input
                type="checkbox"
                id="showInNav"
                checked={formData.show_in_nav}
                onChange={(e) => setFormData({ ...formData, show_in_nav: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="showInNav" className="text-sm font-semibold">
                Show in navigation
              </label>
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex flex-row items-center gap-2"
            >
              <Check size={18} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Pages List */}
      {pages.length > 0 ? (
        <div className="flex flex-col gap-4">
          {pages.map((page) => (
            <div key={page.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-custom-accent">{page.title}</h3>
                <p className="text-sm text-gray-600">/{page.slug}</p>
                {page.image_url && <p className="text-xs text-gray-500">✓ Has image</p>}
              </div>
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => handleEdit(page)}
                  className="px-4 py-2 rounded-lg font-semibold border border-custom-accent text-custom-accent hover:bg-custom-accent hover:text-white transition flex flex-row items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(page.id)}
                  className="px-4 py-2 rounded-lg font-semibold border border-red-400 text-red-600 hover:bg-red-50 transition flex flex-row items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {isCreating ? 'Create your first page' : 'No pages yet. Create one to get started.'}
        </div>
      )}
    </div>
  );
}

