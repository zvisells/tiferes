'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function FloatingSponsorButton() {
  const [sponsorLink, setSponsorLink] = useState('https://abcharity.org/Yehadis');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (response.ok) {
          const data = await response.json();
          setSponsorLink(data.sponsor_link || 'https://abcharity.org/Yehadis');
        }
      } catch (error) {
        console.error('Failed to fetch sponsor link:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <a
      href={sponsorLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex flex-row items-center gap-2 px-4 py-3 rounded-lg font-semibold bg-custom-accent text-white hover:opacity-90 transition shadow-lg hover:shadow-xl"
      title="Sponsor a Shiur"
    >
      <Heart size={18} fill="currentColor" />
      <span className="hidden sm:inline">Sponsor a Shiur</span>
      <span className="sm:hidden">Sponsor</span>
    </a>
  );
}


