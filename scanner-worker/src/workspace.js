import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(MODULE_DIR, "..", "tmp");

export async function createScanWorkspace(uploadId) {
  if (!uploadId?.trim()) {
    throw new Error("Upload ID is required to create scan workspace.");
  }

  const safeUploadId = uploadId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const workspacePath = path.join(WORKSPACE_ROOT, safeUploadId);

  await fs.mkdir(workspacePath, {
    recursive: true,
  });

  return workspacePath;
}

export async function removeScanWorkspace(workspacePath) {
  if (!workspacePath) {
    return;
  }

  const resolvedPath = path.resolve(workspacePath);
  const relativePath = path.relative(WORKSPACE_ROOT, resolvedPath);

  if (
    !relativePath ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("Refusing to remove path outside scanner workspace.");
  }

  await fs.rm(resolvedPath, {
    recursive: true,
    force: true,
  });
}
