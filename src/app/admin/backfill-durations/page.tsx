'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Shiur } from '@/lib/types';

export default function BackfillDurationsPage() {
  const router = useRouter();
  const [shiurim, setShiurim] = useState<Shiur[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState({ processed: 0, failed: 0, total: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/admin');
      }
    };
    checkAuth();
  }, [router]);

  const addLog = (message: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const loadShiurim = async () => {
    try {
      addLog('Fetching shiurim that need duration backfill...');
      const { data, error } = await supabase
        .from('shiurim')
        .select('*')
        .or('duration.is.null,duration.eq.--:--');

      if (error) throw error;

      setShiurim(data || []);
      setStats({ processed: 0, failed: 0, total: data?.length || 0 });
      addLog(`Found ${data?.length || 0} shiurim to process`);
    } catch (error) {
      addLog(`Error loading shiurim: ${error}`);
    }
  };

  const calculateDuration = (audioUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = audioUrl;

      const timeout = setTimeout(() => {
        audio.removeEventListener('loadedmetadata', handleMetadata);
        audio.removeEventListener('error', handleError);
        resolve('--:--');
      }, 30000); // 30 second timeout

      const handleMetadata = () => {
        clearTimeout(timeout);
        const totalSeconds = Math.floor(audio.duration);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let durationStr = '';
        if (hours > 0) {
          durationStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        resolve(durationStr);
      };

      const handleError = () => {
        clearTimeout(timeout);
        resolve('--:--');
      };

      audio.addEventListener('loadedmetadata', handleMetadata);
      audio.addEventListener('error', handleError);
    });
  };

  const processShiur = async (shiur: Shiur, index: number) => {
    try {
      addLog(`Processing [${index + 1}/${stats.total}]: ${shiur.title}...`);
      
      const duration = await calculateDuration(shiur.audio_url);
      
      if (duration === '--:--') {
        addLog(`  ⚠️ Failed to calculate duration for: ${shiur.title}`);
        setStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
        return false;
      }

      const { error } = await supabase
        .from('shiurim')
        .update({ duration })
        .eq('id', shiur.id);

      if (error) throw error;

      addLog(`  ✓ Updated ${shiur.title} with duration: ${duration}`);
      setStats((prev) => ({ ...prev, processed: prev.processed + 1 }));
      return true;
    } catch (error) {
      addLog(`  ✗ Error updating ${shiur.title}: ${error}`);
      setStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
      return false;
    }
  };

  const startBackfill = async () => {
    if (shiurim.length === 0) {
      addLog('No shiurim to process. Load shiurim first.');
      return;
    }

    setProcessing(true);
    setCurrentIndex(0);
    setLog([]);
    addLog('Starting backfill process...');

    for (let i = 0; i < shiurim.length; i++) {
      setCurrentIndex(i);
      await processShiur(shiurim[i], i);
      
      // Small delay to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    addLog('✓ Backfill process completed!');
    addLog(`Summary: ${stats.processed} processed, ${stats.failed} failed`);
    setProcessing(false);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-custom-accent">Backfill Shiur Durations</h1>
      
      <div className="flex flex-col gap-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900">ℹ️ About This Tool</h2>
        <p className="text-sm text-blue-800">
          This tool will calculate and save durations for all shiurim that don't have one yet.
          It loads each audio file in the browser to extract the duration, then updates the database.
          This process may take a few minutes depending on the number of shiurim.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-custom-accent">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="p-4 bg-green-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700">{stats.processed}</div>
          <div className="text-sm text-gray-600">Processed</div>
        </div>
        <div className="p-4 bg-red-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Progress */}
      {processing && stats.total > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(((currentIndex + 1) / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-custom-accent h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-row gap-4">
        <button
          onClick={loadShiurim}
          disabled={processing}
          className="btn-secondary"
        >
          Load Shiurim
        </button>
        <button
          onClick={startBackfill}
          disabled={processing || shiurim.length === 0}
          className="btn-primary"
        >
          {processing ? 'Processing...' : 'Start Backfill'}
        </button>
      </div>

      {/* Log */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Process Log</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
          {log.length === 0 && <div className="text-gray-500">No logs yet. Click "Load Shiurim" to start.</div>}
          {log.map((entry, idx) => (
            <div key={idx}>{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

