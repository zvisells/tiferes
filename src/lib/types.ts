export interface TimestampTopic {
  topic: string;
  time: string; // HH:MM:SS
}

export type MediaType = 'audio' | 'video';

export interface Shiur {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  image_url?: string;
  audio_url: string;
  media_type?: MediaType;
  timestamps?: TimestampTopic[];
  allow_download: boolean;
  transcript?: string;
  parsha?: string;
  duration?: string; // HH:MM:SS or MM:SS format
  likes?: number;
  created_at: string;
}

export function detectMediaType(file: File): MediaType {
  return file.type.startsWith('video/') ? 'video' : 'audio';
}

export function inferMediaTypeFromUrl(url: string): MediaType {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  const lower = url.toLowerCase().split('?')[0];
  return videoExtensions.some(ext => lower.endsWith(ext)) ? 'video' : 'audio';
}

export interface DiscourseSchedule {
  id: string;
  weekday: string;
  time: string;
  location?: string;
  next_occurrence: string;
}

export interface AdminUser {
  email: string;
  password_hash: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  show_in_nav: boolean;
  created_at: string;
  updated_at: string;
}

