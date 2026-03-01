import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uuidSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!uuidSchema.safeParse(params.id).success) {
    return NextResponse.json({ error: "Invalid recording ID" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("recordings")
    .select("id, anonymous_name, emotion, audio_url, latitude, longitude, location_text, duration, created_at, is_approved, reports_count")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const idParsed = uuidSchema.safeParse(params.id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid recording ID" }, { status: 400 });
  }

  const deviceId = request.headers.get("x-device-id");
  if (!deviceId) {
    return NextResponse.json({ error: "Missing device ID" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch the recording to verify ownership
  const { data: recording, error: fetchError } = await admin
    .from("recordings")
    .select("id, user_id, audio_url")
    .eq("id", params.id)
    .single();

  if (fetchError || !recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  if (recording.user_id !== deviceId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Delete audio file from storage
  const url = new URL(recording.audio_url);
  const storagePath = url.pathname.split("/recordings/").pop();
  if (storagePath) {
    await admin.storage.from("recordings").remove([decodeURIComponent(storagePath)]);
  }

  // Delete comments and reports first, then the recording
  await admin.from("comments").delete().eq("recording_id", params.id);
  await admin.from("reports").delete().eq("recording_id", params.id);

  const { error: deleteError } = await admin
    .from("recordings")
    .delete()
    .eq("id", params.id);

  if (deleteError) {
    console.error("Failed to delete recording:", deleteError.message);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
