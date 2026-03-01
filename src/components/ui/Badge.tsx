import { EMOTIONS } from "@/lib/constants";
import { Emotion } from "@/types/emotion";

interface BadgeProps {
  emotion: Emotion;
}

export function Badge({ emotion }: BadgeProps) {
  const config = EMOTIONS[emotion];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
