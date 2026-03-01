import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-client.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { recording_id } = await req.json();

    if (!recording_id) {
      return new Response(
        JSON.stringify({ error: "Missing recording_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    const { data: recording } = await supabase
      .from("recordings")
      .select("reports_count, is_approved")
      .eq("id", recording_id)
      .single();

    if (!recording) {
      return new Response(
        JSON.stringify({ error: "Recording not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (recording.reports_count > 5 && recording.is_approved) {
      await supabase
        .from("recordings")
        .update({ is_approved: false })
        .eq("id", recording_id);

      return new Response(
        JSON.stringify({ action: "hidden", recording_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ action: "none", recording_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
