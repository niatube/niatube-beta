export const ScanStatus = Object.freeze({
  CLEAN: "clean",
  INFECTED: "infected",
  ERROR: "error",
  TIMEOUT: "timeout",
});

export function createScanResult({
  status,
  provider,
  engineVersion = null,
  result = null,
}) {
  if (!Object.values(ScanStatus).includes(status)) {
    throw new Error(`Invalid malware scan result status: ${status}`);
  }

  if (!provider?.trim()) {
    throw new Error("Malware scan provider is required.");
  }

  return {
    status,
    provider: provider.trim(),
    engineVersion,
    result,
  };
}
