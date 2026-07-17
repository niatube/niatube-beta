import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function getBroadcastByUpload(uploadId: string) {
  const supabase = getSupabaseAdmin();

  return supabase
    .from("live_broadcasts")
    .select("*")
    .eq("upload_id", uploadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function createBroadcast(input: {
  uploadId: string;
  creatorName: string;
  title: string;
  description?: string | null;
  scheduledAt?: string | null;
}) {
  const supabase = getSupabaseAdmin();

  return supabase
    .from("live_broadcasts")
    .insert({
      upload_id: input.uploadId,
      creator_name: input.creatorName,
      title: input.title,
      description: input.description ?? null,
      scheduled_at: input.scheduledAt ?? null,
      status: "scheduled",
    })
    .select()
    .single();
}

export async function recordBroadcastEvent(input: {
  broadcastId: string;
  eventType: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  actorType?: string;
  actorIdentifier?: string | null;
  eventData?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdmin();

  return supabase
    .from("live_broadcast_events")
    .insert({
      broadcast_id: input.broadcastId,
      event_type: input.eventType,
      previous_status: input.previousStatus ?? null,
      new_status: input.newStatus ?? null,
      actor_type: input.actorType ?? "system",
      actor_identifier: input.actorIdentifier ?? null,
      event_data: input.eventData ?? {},
    });
}