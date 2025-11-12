'use client';

import React, { useEffect, useState } from 'react';
import { DiscourseSchedule } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Clock, MapPin, Edit2, Check, X } from 'lucide-react';

export default function DiscourseWidget() {
  const [discourse, setDiscourse] = useState<DiscourseSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    weekday: '',
    time: '',
    location: '',
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };
    checkAdmin();
  }, []);

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
        setEditedData({
          weekday: data.weekday || '',
          time: data.time || '',
          location: data.location || '',
        });
      } catch (error) {
        console.error('Error fetching discourse schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscourse();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!discourse) return;

      const { error } = await supabase
        .from('discourse_schedule')
        .update({
          weekday: editedData.weekday,
          time: editedData.time,
          location: editedData.location,
        })
        .eq('id', discourse.id);

      if (error) throw error;

      setDiscourse({
        ...discourse,
        weekday: editedData.weekday,
        time: editedData.time,
        location: editedData.location,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (discourse) {
      setEditedData({
        weekday: discourse.weekday || '',
        time: discourse.time || '',
        location: discourse.location || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!discourse) {
    return null;
  }

  if (isEditing && isAdmin) {
    return (
      <div className="next-discourse flex flex-col gap-2 text-white text-xs p-3 bg-white bg-opacity-10 rounded-lg">
        <div className="flex flex-row items-center justify-between">
          <div className="font-semibold">Next Discourse</div>
          <div className="flex flex-row gap-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              title="Save"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editedData.weekday}
            onChange={(e) => setEditedData({ ...editedData, weekday: e.target.value })}
            placeholder="e.g., Monday"
            className="px-2 py-1 rounded text-sm text-black"
          />
          <input
            type="text"
            value={editedData.time}
            onChange={(e) => setEditedData({ ...editedData, time: e.target.value })}
            placeholder="e.g., 8:00 PM"
            className="px-2 py-1 rounded text-sm text-black"
          />
          <input
            type="text"
            value={editedData.location}
            onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
            placeholder="e.g., Main Hall"
            className="px-2 py-1 rounded text-sm text-black"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="next-discourse flex flex-col gap-1 text-white text-xs md:text-sm group">
      <div className="flex flex-row items-center justify-between">
        <div className="font-semibold">Next Discourse</div>
        {isAdmin && (
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white hover:bg-opacity-20 rounded"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>
      <div className="flex flex-row items-center gap-2 flex-wrap">
        <div className="flex flex-row items-center gap-1">
          <Clock size={14} />
          <span>{discourse.weekday}, {discourse.time}</span>
        </div>
        {discourse.location && (
          <div className="flex flex-row items-center gap-1">
            <MapPin size={14} />
            <span>{discourse.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

