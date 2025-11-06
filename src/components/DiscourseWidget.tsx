'use client';

import React, { useEffect, useState } from 'react';
import { DiscourseSchedule } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Clock, MapPin } from 'lucide-react';

export default function DiscourseWidget() {
  const [discourse, setDiscourse] = useState<DiscourseSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscourse = async () => {
      try {
        // Get the first/main discourse schedule (or could filter by nearest upcoming)
        const { data, error } = await supabase
          .from('discourse_schedule')
          .select('*')
          .limit(1)
          .single();

        if (error) throw error;
        setDiscourse(data);
      } catch (error) {
        console.error('Error fetching discourse schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscourse();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!discourse) {
    return null;
  }

  return (
    <div className="next-discourse flex flex-col gap-2 p-4 bg-custom-accent text-white rounded-lg">
      <div className="text-sm font-semibold">Next Discourse</div>
      <div className="flex flex-row items-center gap-2">
        <Clock size={16} />
        <span className="text-sm">{discourse.weekday}, {discourse.time}</span>
      </div>
      {discourse.location && (
        <div className="flex flex-row items-center gap-2">
          <MapPin size={16} />
          <span className="text-sm">{discourse.location}</span>
        </div>
      )}
    </div>
  );
}

