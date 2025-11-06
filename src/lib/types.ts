export interface TimestampTopic {
  topic: string;
  time: string; // HH:MM:SS
}

export interface Shiur {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  image_url?: string;
  audio_url: string;
  timestamps?: TimestampTopic[];
  allow_download: boolean;
  transcript?: string;
  created_at: string;
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

