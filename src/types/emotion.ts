export type Emotion =
  | "happy"
  | "sad"
  | "anxious"
  | "grateful"
  | "frustrated"
  | "sleepless"
  | "hopeful"
  | "nostalgic";

export interface EmotionConfig {
  label: string;
  color: string;
}
