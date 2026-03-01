"use client";

import { create } from "zustand";

export type RecorderPhase =
  | "idle"
  | "requesting"
  | "recording"
  | "stopped"
  | "error";

interface RecorderState {
  phase: RecorderPhase;
  duration: number;
  blob: Blob | null;
  error: string | null;

  setPhase: (phase: RecorderPhase) => void;
  setDuration: (duration: number) => void;
  setBlob: (blob: Blob) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useRecorderStore = create<RecorderState>((set) => ({
  phase: "idle",
  duration: 0,
  blob: null,
  error: null,

  setPhase: (phase) => set({ phase, error: null }),
  setDuration: (duration) => set({ duration }),
  setBlob: (blob) => set({ blob }),
  setError: (error) => set({ error, phase: "error" }),
  reset: () => set({ phase: "idle", duration: 0, blob: null, error: null }),
}));
