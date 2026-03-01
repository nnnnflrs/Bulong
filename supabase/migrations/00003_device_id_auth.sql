-- Remove auth.users foreign key constraints since we use device IDs instead of Supabase auth
-- Change user_id columns to TEXT to support device UUID strings

-- Drop FK constraints
ALTER TABLE public.recordings DROP CONSTRAINT IF EXISTS recordings_user_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_user_id_fkey;
ALTER TABLE public.rate_limits DROP CONSTRAINT IF EXISTS rate_limits_user_id_fkey;

-- Change user_id columns to TEXT
ALTER TABLE public.recordings ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.comments ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.reports ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.rate_limits ALTER COLUMN user_id TYPE TEXT;

-- Update rate limit functions to accept TEXT user_id
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_fingerprint TEXT, p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_time TIMESTAMPTZ;
BEGIN
  SELECT last_recording_at INTO last_time
  FROM rate_limits
  WHERE device_fingerprint = p_fingerprint OR user_id = p_user_id
  ORDER BY last_recording_at DESC
  LIMIT 1;

  IF last_time IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN (NOW() - last_time) > INTERVAL '1 day';
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_rate_limit(p_fingerprint TEXT, p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO rate_limits (device_fingerprint, user_id, last_recording_at)
  VALUES (p_fingerprint, p_user_id, NOW())
  ON CONFLICT (device_fingerprint, user_id)
  DO UPDATE SET last_recording_at = NOW();
END;
$$;

-- Update RLS policies for recordings to allow select by device_id
DROP POLICY IF EXISTS "select_approved" ON public.recordings;
CREATE POLICY "select_approved" ON public.recordings
  FOR SELECT USING (is_approved = TRUE AND reports_count <= 5);

-- Allow delete by owner (device_id matches user_id)
CREATE POLICY "delete_own" ON public.recordings
  FOR DELETE USING (true);
-- Note: actual ownership check is done in the API layer since we use admin client
