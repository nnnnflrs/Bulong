-- Add a table to track comment rate limits
CREATE TABLE IF NOT EXISTS public.comment_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  recording_id UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  last_comment_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_device_recording_comment_limit UNIQUE (device_id, recording_id)
);

-- Enable RLS
ALTER TABLE public.comment_rate_limits ENABLE ROW LEVEL SECURITY;
