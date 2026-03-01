"use client";

import { create } from "zustand";
import { RecordingMarkerData } from "@/types/recording";
import { RECORDINGS_PAGE_SIZE } from "@/lib/constants";

interface RecordingsState {
  recordings: RecordingMarkerData[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchRecordings: (date?: string | null) => Promise<void>;
}

export const useRecordingsStore = create<RecordingsState>((set) => ({
  recordings: [],
  isLoading: false,
  hasFetched: false,

  fetchRecordings: async (date?: string | null) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({
        north: "90",
        south: "-90",
        east: "180",
        west: "-180",
        limit: RECORDINGS_PAGE_SIZE.toString(),
      });

      if (date) {
        params.set("date", date);
      }

      const res = await fetch(`/api/recordings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch recordings");

      const { data } = await res.json();
      set({ recordings: data, hasFetched: true });
    } catch (err) {
      console.error("Error fetching recordings:", err);
      set({ hasFetched: true });
    } finally {
      set({ isLoading: false });
    }
  },
}));
