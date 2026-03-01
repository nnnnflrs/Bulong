import { Emotion } from "./emotion";

export interface Recording {
  id: string;
  user_id: string;
  anonymous_name: string;
  emotion: Emotion;
  audio_url: string;
  latitude: number;
  longitude: number;
  location_text: string;
  duration: number;
  is_approved: boolean;
  reports_count: number;
  created_at: string;
}

export interface RecordingMarkerData {
  id: string;
  emotion: Emotion;
  latitude: number;
  longitude: number;
  anonymous_name: string;
  created_at: string;
}

export interface RecordingInsert {
  anonymous_name: string;
  emotion: Emotion;
  latitude: number;
  longitude: number;
  location_text: string;
  duration: number;
  device_fingerprint: string;
}
