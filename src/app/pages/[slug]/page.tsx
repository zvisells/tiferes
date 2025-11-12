import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Page } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';

async function getPage(slug: string): Promise<Page | null> {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export default async function PageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-custom-accent mb-4">Page Not Found</h1>
          <Link href="/" className="text-custom-accent hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-4xl mx-auto py-8">
      {/* Back Button */}
      <Link href="/" className="flex flex-row items-center gap-2 text-custom-accent hover:opacity-80 transition w-fit">
        <ChevronLeft size={18} />
        Back
      </Link>

      {/* Title */}
      <h1 className="text-4xl font-bold text-custom-accent">{page.title}</h1>

      {/* Image */}
      {page.image_url && (
        <div className="w-full h-64 md:h-96 bg-gray-200 rounded-2xl overflow-hidden">
          <img
            src={page.image_url}
            alt={page.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-sm md:prose-base max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
          {page.content}
        </p>
      </div>
    </div>
  );
}

