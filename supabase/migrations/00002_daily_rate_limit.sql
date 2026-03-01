-- Change rate limit from 6 hours to 1 day (24 hours)
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_fingerprint TEXT, p_user_id UUID)
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
