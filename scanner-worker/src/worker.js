import { getConfig } from "./config.js";
import { createSupabaseClient } from "./supabase.js";
import {
  findPendingScan,
  claimPendingScan,
  completeScan,
} from "./scan-jobs.js";
import { createSignedOriginalUrl } from "./bunny-token.js";
import { getBunnyVideoStatus } from "./bunny-video.js";
import { scanBunnyVideo } from "./scan-pipeline.js";

async function main() {
  const config = getConfig();
  const supabase = createSupabaseClient(config);

  console.log("NiaTube malware scanner worker initialized.");

  const pendingScan = await findPendingScan(supabase);

  if (!pendingScan) {
    console.log("No pending malware scans found.");
    return;
  }

  console.log("Pending malware scan found:", {
    id: pendingScan.id,
    title: pendingScan.title,
    bunnyVideoId: pendingScan.bunny_video_id,
    malwareScanStatus: pendingScan.malware_scan_status,
  });

  if (!pendingScan.bunny_video_id) {
    console.log(
      "Pending malware scan has no Bunny video ID; leaving it pending."
    );
    return;
  }

  const bunnyStatus = await getBunnyVideoStatus(
    config,
    pendingScan.bunny_video_id
  );

  if (!bunnyStatus.ready) {
    console.log("Bunny video is not ready for malware scanning:", {
      id: pendingScan.id,
      bunnyVideoId: pendingScan.bunny_video_id,
      bunnyStatus: bunnyStatus.status,
      availableResolutions: bunnyStatus.availableResolutions,
    });
    return;
  }

  console.log("Bunny video is ready for malware scanning:", {
    id: pendingScan.id,
    bunnyVideoId: pendingScan.bunny_video_id,
    bunnyStatus: bunnyStatus.status,
  });

  const claimedScan = await claimPendingScan(
    supabase,
    pendingScan.id
  );

  if (!claimedScan) {
    console.log(
      "Pending malware scan was claimed by another worker."
    );
    return;
  }

  console.log("Malware scan claimed:", {
    id: claimedScan.id,
    bunnyVideoId: claimedScan.bunny_video_id,
    malwareScanStatus: claimedScan.malware_scan_status,
  });

  if (!claimedScan.bunny_video_id) {
    throw new Error(
      `Claimed upload ${claimedScan.id} has no Bunny video ID.`
    );
  }

  const signedUrl = createSignedOriginalUrl(
    config,
    claimedScan.bunny_video_id,
    300
  );

  console.log(
    "Short-lived Bunny original URL generated for malware scan."
  );

  const scanResult = await scanBunnyVideo({
    config,
    uploadId: claimedScan.id,
    signedUrl,
  });

  console.log("Malware scan completed:", {
    id: claimedScan.id,
    status: scanResult.status,
    provider: scanResult.provider,
  });

  const completedScan = await completeScan(
    supabase,
    claimedScan.id,
    scanResult
  );

  if (!completedScan) {
    throw new Error(
      `Failed to persist malware scan result for upload ${claimedScan.id}.`
    );
  }

  console.log("Malware scan result persisted:", {
    id: completedScan.id,
    status: completedScan.malware_scan_status,
    provider: completedScan.malware_scan_provider,
  });
}

main().catch((error) => {
  console.error(
    "Scanner worker failed:",
    error instanceof Error ? error.message : String(error)
  );
  process.exitCode = 1;
});
