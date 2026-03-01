"use client";

import { useRef, useCallback, useEffect } from "react";
import { useRecorderStore } from "@/stores/recorderStore";
import { MAX_DURATION } from "@/lib/constants";
import { getPreferredMimeType } from "@/lib/utils/audio";

export function useMediaRecorder() {
  const {
    phase,
    duration,
    blob,
    setPhase,
    setDuration,
    setBlob,
    setError,
    reset,
  } = useRecorderStore();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const start = useCallback(async () => {
    try {
      setPhase("requesting");
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = getPreferredMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, { type: mimeType });
        setBlob(recordedBlob);
        setPhase("stopped");
      };

      recorder.start(100);
      startTimeRef.current = Date.now();
      setPhase("recording");

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDuration(Math.floor(elapsed));

        if (elapsed >= MAX_DURATION) {
          recorder.stop();
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 100);
    } catch (err) {
      cleanup();
      setError(
        err instanceof Error ? err.message : "Microphone access denied"
      );
    }
  }, [setPhase, setDuration, setBlob, setError, cleanup]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  }, []);

  const cancel = useCallback(() => {
    cleanup();
    reset();
  }, [cleanup, reset]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    phase,
    duration,
    blob,
    analyserNode: analyserRef.current,
    start,
    stop,
    cancel,
    reset,
  };
}
