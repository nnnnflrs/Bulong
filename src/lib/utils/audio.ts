import { ALLOWED_AUDIO_TYPES, MAX_AUDIO_SIZE } from "@/lib/constants";

export function isValidAudioType(mimeType: string): boolean {
  return ALLOWED_AUDIO_TYPES.some((allowed) => mimeType.startsWith(allowed));
}

export function isValidAudioSize(size: number): boolean {
  return size > 0 && size <= MAX_AUDIO_SIZE;
}

export function getPreferredMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";

  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }

  return "audio/webm";
}