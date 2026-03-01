export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      recordings: {
        Row: {
          id: string;
          user_id: string;
          anonymous_name: string;
          emotion: "happy" | "sad" | "anxious" | "grateful" | "frustrated" | "sleepless" | "hopeful" | "nostalgic";
          audio_url: string;
          latitude: number;
          longitude: number;
          location_text: string;
          duration: number;
          is_approved: boolean;
          reports_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anonymous_name: string;
          emotion: "happy" | "sad" | "anxious" | "grateful" | "frustrated" | "sleepless" | "hopeful" | "nostalgic";
          audio_url: string;
          latitude: number;
          longitude: number;
          location_text?: string;
          duration: number;
          is_approved?: boolean;
          reports_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anonymous_name?: string;
          emotion?: "happy" | "sad" | "anxious" | "grateful" | "frustrated" | "sleepless" | "hopeful" | "nostalgic";
          audio_url?: string;
          latitude?: number;
          longitude?: number;
          location_text?: string;
          duration?: number;
          is_approved?: boolean;
          reports_count?: number;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          recording_id: string;
          user_id: string;
          anonymous_name: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recording_id: string;
          user_id: string;
          anonymous_name: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recording_id?: string;
          user_id?: string;
          anonymous_name?: string;
          content?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          recording_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recording_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recording_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          device_fingerprint: string;
          user_id: string;
          last_recording_at: string;
        };
        Insert: {
          id?: string;
          device_fingerprint: string;
          user_id: string;
          last_recording_at?: string;
        };
        Update: {
          id?: string;
          device_fingerprint?: string;
          user_id?: string;
          last_recording_at?: string;
        };
      };
    };
    Functions: {
      increment_reports_count: {
        Args: { target_recording_id: string };
        Returns: void;
      };
      check_rate_limit: {
        Args: { p_fingerprint: string; p_user_id: string };
        Returns: boolean;
      };
      upsert_rate_limit: {
        Args: { p_fingerprint: string; p_user_id: string };
        Returns: void;
      };
    };
    Enums: {
      emotion: "happy" | "sad" | "anxious" | "grateful" | "frustrated" | "sleepless" | "hopeful" | "nostalgic";
    };
  };
}
