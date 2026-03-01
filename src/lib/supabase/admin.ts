import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL. " +
        "Please set it in your .env file."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY. " +
        "Please set it in your .env file."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
