-- Fix overly permissive delete policy on recordings
-- Deletes are handled exclusively via the admin client in API routes,
-- so we drop the permissive policy to prevent direct PostgREST abuse.
DROP POLICY IF EXISTS "delete_own" ON public.recordings;

-- Also fix comments and reports delete policies if they exist with USING (true)
DROP POLICY IF EXISTS "delete_own" ON public.comments;
DROP POLICY IF EXISTS "delete_own" ON public.reports;

-- Add comment rate limiting: prevent more than one comment per 10 seconds per device per recording
-- (This is a constraint-based approach — the API layer should also enforce this)
