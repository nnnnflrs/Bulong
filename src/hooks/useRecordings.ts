"use client";

import { useEffect } from "react";
import { useRecordingsStore } from "@/stores/recordingsStore";
import { useMapStore } from "@/stores/mapStore";

export function useRecordings() {
  const recordings = useRecordingsStore((s) => s.recordings);
  const isLoading = useRecordingsStore((s) => s.isLoading);
  const hasFetched = useRecordingsStore((s) => s.hasFetched);
  const fetchRecordings = useRecordingsStore((s) => s.fetchRecordings);
  const selectedDate = useMapStore((s) => s.selectedDate);

  // Initial fetch
  useEffect(() => {
    if (!hasFetched) {
      fetchRecordings(selectedDate);
    }
  }, [hasFetched, fetchRecordings, selectedDate]);

  // Refetch when selectedDate changes
  useEffect(() => {
    if (hasFetched) {
      fetchRecordings(selectedDate);
    }
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    recordings,
    isLoading,
    refetch: () => fetchRecordings(selectedDate),
  };
}
