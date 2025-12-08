'use client';

import React from 'react';
import { Heart } from 'lucide-react';

export default function FloatingSponsorButton() {
  const sponsorLink = 'https://abcharity.org/Yehadis';

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

