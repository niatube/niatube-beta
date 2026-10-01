export async function findPendingScan(supabase) {
  const { data, error } = await supabase
    .from("uploads")
    .select(
      "id, title, bunny_video_id, malware_scan_status, is_live, created_at"
    )
    .eq("malware_scan_status", "pending")
    .eq("is_live", false)
    .not("bunny_video_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find pending malware scan: ${error.message}`);
  }

  return data;
}
export async function claimPendingScan(supabase, uploadId) {
  const startedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("uploads")
    .update({
      malware_scan_status: "scanning",
      malware_scan_started_at: startedAt,
      malware_scan_updated_at: startedAt,
    })
    .eq("id", uploadId)
    .eq("malware_scan_status", "pending")
    .select(
      "id, title, bunny_video_id, malware_scan_status, malware_scan_started_at"
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to claim malware scan: ${error.message}`);
  }

  return data;
}
export async function completeScan(
  supabase,
  uploadId,
  {
    status,
    provider,
    engineVersion,
    result,
  }
) {
  const allowedStatuses = [
    "clean",
    "infected",
    "error",
    "timeout",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid completed malware scan status: ${status}`);
  }

  const completedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("uploads")
    .update({
      malware_scan_status: status,
      malware_scan_provider: provider || null,
      malware_scan_engine_version: engineVersion || null,
      malware_scan_result: result || null,
      malware_scan_completed_at: completedAt,
      malware_scan_updated_at: completedAt,
    })
    .eq("id", uploadId)
    .eq("malware_scan_status", "scanning")
    .select(
      "id, malware_scan_status, malware_scan_provider, malware_scan_engine_version, malware_scan_completed_at"
    )
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to complete malware scan: ${error.message}`);
  }

  return data;
}
export async function recoverStaleScans(
  supabase,
  staleAfterMinutes = 60
) {
  if (
    !Number.isFinite(staleAfterMinutes) ||
    staleAfterMinutes <= 0
  ) {
    throw new Error(
      "Stale scan threshold must be a positive number of minutes."
    );
  }

  const cutoff = new Date(
    Date.now() - staleAfterMinutes * 60 * 1000
  ).toISOString();

  const recoveredAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("uploads")
    .update({
      malware_scan_status: "error",
      malware_scan_result:
        "Malware scan did not complete within the worker recovery window.",
      malware_scan_completed_at: recoveredAt,
      malware_scan_updated_at: recoveredAt,
    })
    .eq("malware_scan_status", "scanning")
    .lt("malware_scan_started_at", cutoff)
    .select("id, malware_scan_status, malware_scan_started_at");

  if (error) {
    throw new Error(
      `Failed to recover stale malware scans: ${error.message}`
    );
  }

  return data || [];
}
export async function retryFailedScan(supabase, uploadId) {
  if (!uploadId?.trim()) {
    throw new Error("Upload ID is required to retry malware scan.");
  }

  const retriedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("uploads")
    .update({
      malware_scan_status: "pending",
      malware_scan_provider: null,
      malware_scan_engine_version: null,
      malware_scan_result: null,
      malware_scan_started_at: null,
      malware_scan_completed_at: null,
      malware_scan_updated_at: retriedAt,
    })
    .eq("id", uploadId)
    .in("malware_scan_status", ["error", "timeout"])
    .eq("is_live", false)
    .not("bunny_video_id", "is", null)
    .select(
      "id, bunny_video_id, malware_scan_status, malware_scan_updated_at"
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to retry malware scan: ${error.message}`
    );
  }

  return data;
}