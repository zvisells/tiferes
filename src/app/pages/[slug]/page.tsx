'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Page } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';

export default function PageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/pages/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPage(data);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto py-8">
        <div className="text-center py-12 text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

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

      {/* Header with Optional Button */}
      <div className="flex flex-row items-start justify-between gap-4 flex-wrap">
        <h1 className="text-4xl font-bold text-custom-accent flex-1">{page.title}</h1>
        {page.button_text && page.button_link && (
          <a
            href={page.button_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary whitespace-nowrap"
          >
            {page.button_text}
          </a>
        )}
      </div>

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

