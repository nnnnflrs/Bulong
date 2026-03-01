import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { boundsSchema, recordingMetadataSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/utils/sanitize";
import { RECORDINGS_PAGE_SIZE, MAX_NAME_LENGTH, RATE_LIMIT_HOURS } from "@/lib/constants";
import { isValidAudioType, isValidAudioSize } from "@/lib/utils/audio";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const parsed = boundsSchema.safeParse({
    north: Number(searchParams.get("north")),
    south: Number(searchParams.get("south")),
    east: Number(searchParams.get("east")),
    west: Number(searchParams.get("west")),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bounds" }, { status: 400 });
  }

  const { north, south, east, west } = parsed.data;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    RECORDINGS_PAGE_SIZE,
    Number(searchParams.get("limit")) || RECORDINGS_PAGE_SIZE
  );
  const dateParam = searchParams.get("date"); // YYYY-MM-DD or null

  const admin = createAdminClient();

  let query = admin
    .from("recordings")
    .select(
      "id, anonymous_name, emotion, latitude, longitude, created_at",
      { count: "exact" }
    )
    .eq("is_approved", true)
    .lte("reports_count", 5)
    .gte("latitude", south)
    .lte("latitude", north)
    .gte("longitude", west)
    .lte("longitude", east);

  // Filter by date if provided
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const startOfDay = `${dateParam}T00:00:00.000Z`;
    const nextDay = new Date(dateParam + "T00:00:00.000Z");
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const endOfDay = nextDay.toISOString();
    query = query.gte("created_at", startOfDay).lt("created_at", endOfDay);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error("Failed to fetch recordings:", error.message);
    return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], count, page });
}

export async function POST(request: NextRequest) {
  const admin = createAdminClient();

  const formData = await request.formData();
  const audioFile = formData.get("audio") as File | null;
  const metadataRaw = formData.get("metadata") as string | null;

  if (!audioFile || !metadataRaw) {
    return NextResponse.json(
      { error: "Missing audio or metadata" },
      { status: 400 }
    );
  }

  if (!isValidAudioType(audioFile.type)) {
    return NextResponse.json(
      { error: "Invalid audio format" },
      { status: 400 }
    );
  }

  if (!isValidAudioSize(audioFile.size)) {
    return NextResponse.json(
      { error: "Audio file too large (max 10MB)" },
      { status: 400 }
    );
  }

  let metadata;
  try {
    metadata = JSON.parse(metadataRaw);
  } catch {
    return NextResponse.json(
      { error: "Invalid metadata JSON" },
      { status: 400 }
    );
  }

  const parsed = recordingMetadataSchema.safeParse(metadata);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }

  const meta = parsed.data;

  // Check rate limit (skip if DISABLE_RATE_LIMIT is set)
  if (process.env.DISABLE_RATE_LIMIT !== "true") {
    const cutoff = new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString();

    const { data: recent, error: rateLimitError } = await admin
      .from("rate_limits")
      .select("last_recording_at")
      .eq("device_fingerprint", meta.device_fingerprint)
      .gte("last_recording_at", cutoff)
      .limit(1);

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError.message);
    } else if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: "You can only post one recording per hour." },
        { status: 429 }
      );
    }
  }

  // Upload audio file
  const ext = audioFile.type.includes("webm") ? "webm" : "ogg";
  const fileId = crypto.randomUUID();
  const storagePath = `uploads/${fileId}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("recordings")
    .upload(storagePath, audioFile, {
      contentType: audioFile.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload failed:", uploadError.message);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("recordings").getPublicUrl(storagePath);

  // Insert recording
  const { data: recording, error: insertError } = await admin
    .from("recordings")
    .insert({
      user_id: meta.device_fingerprint,
      anonymous_name: sanitizeText(meta.anonymous_name, MAX_NAME_LENGTH),
      emotion: meta.emotion,
      audio_url: publicUrl,
      latitude: meta.latitude,
      longitude: meta.longitude,
      location_text: sanitizeText(meta.location_text || "", 100),
      duration: meta.duration,
      is_approved: true,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to save recording:", insertError.message);
    // Clean up orphaned storage file
    await admin.storage.from("recordings").remove([storagePath]);
    return NextResponse.json(
      { error: "Failed to save recording" },
      { status: 500 }
    );
  }

  // Update rate limit
  await admin
    .from("rate_limits")
    .upsert(
      {
        device_fingerprint: meta.device_fingerprint,
        user_id: meta.device_fingerprint,
        last_recording_at: new Date().toISOString(),
      },
      { onConflict: "device_fingerprint,user_id" }
    );

  return NextResponse.json({ data: recording }, { status: 201 });
}
