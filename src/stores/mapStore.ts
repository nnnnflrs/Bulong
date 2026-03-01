"use client";

import { create } from "zustand";

interface MapState {
  isAutoRotating: boolean;

  selectedRecordingId: string | null;
  isRecordingModalOpen: boolean;
  isUploadModalOpen: boolean;
  selectedDate: string | null;

  setAutoRotating: (rotating: boolean) => void;

  selectRecording: (id: string) => void;
  clearSelection: () => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  setSelectedDate: (date: string | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  isAutoRotating: true,

  selectedRecordingId: null,
  isRecordingModalOpen: false,
  isUploadModalOpen: false,
  selectedDate: null,

  setAutoRotating: (isAutoRotating) => set({ isAutoRotating }),

  selectRecording: (id) =>
    set({
      selectedRecordingId: id,
      isRecordingModalOpen: true,
      isAutoRotating: false,
    }),

  clearSelection: () =>
    set({
      selectedRecordingId: null,
      isRecordingModalOpen: false,
    }),

  openUploadModal: () => set({ isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadModalOpen: false }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
