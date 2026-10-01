import { createScanWorkspace, removeScanWorkspace } from "./workspace.js";
import { downloadBunnyOriginal } from "./bunny-download.js";
import { probeMediaFile } from "./media-validator.js";
import { getClamAvVersion, scanFileWithClamAv } from "./clamav.js";
import { createScanResult, ScanStatus } from "./scanner.js";

export async function scanBunnyVideo({
  config,
  uploadId,
  signedUrl,
}) {
  let workspacePath = null;

  try {
    workspacePath = await createScanWorkspace(uploadId);

    const download = await downloadBunnyOriginal(
      signedUrl,
      workspacePath
    );

    await probeMediaFile(download.filePath);

    const engineVersion = await getClamAvVersion();
    const scan = await scanFileWithClamAv(download.filePath);

    if (scan.infected) {
      return createScanResult({
        status: ScanStatus.INFECTED,
        provider: "ClamAV",
        engineVersion,
        result: scan.output || "Malware detected.",
      });
    }

    return createScanResult({
      status: ScanStatus.CLEAN,
      provider: "ClamAV",
      engineVersion,
      result: "No malware detected.",
    });
   } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    const timedOut =
      message.toLowerCase().includes("timed out");

    return createScanResult({
      status: timedOut
        ? ScanStatus.TIMEOUT
        : ScanStatus.ERROR,
      provider: "ClamAV",
      result: message,
    });
  } finally {
    if (workspacePath) {
      await removeScanWorkspace(workspacePath);
    }
  }
}
