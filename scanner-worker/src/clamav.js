import { spawn } from "node:child_process";

export function getClamAvVersion() {
  return new Promise((resolve, reject) => {
    const child = spawn("clamscan", ["--version"], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(
        new Error(`ClamAV executable is unavailable: ${error.message}`)
      );
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `ClamAV version check failed with exit code ${code}: ${stderr.trim()}`
          )
        );
        return;
      }

      resolve(stdout.trim());
    });
  });
}
export function scanFileWithClamAv(filePath, timeoutMs = 300000) {
  if (!filePath?.trim()) {
    return Promise.reject(new Error("File path is required for malware scan."));
  }

  return new Promise((resolve, reject) => {
    const child = spawn(
      "clamscan",
      ["--no-summary", "--infected", filePath],
      {
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;

      settled = true;
      child.kill("SIGKILL");

      reject(
        new Error(`ClamAV scan timed out after ${timeoutMs} milliseconds.`)
      );
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      if (settled) return;

      settled = true;
      clearTimeout(timer);

      reject(
        new Error(`ClamAV executable is unavailable: ${error.message}`)
      );
    });

    child.on("close", (code) => {
      if (settled) return;

      settled = true;
      clearTimeout(timer);

      if (code === 0) {
        resolve({
          infected: false,
          output: stdout.trim(),
        });
        return;
      }

      if (code === 1) {
        resolve({
          infected: true,
          output: stdout.trim(),
        });
        return;
      }

      reject(
        new Error(
          `ClamAV scan failed with exit code ${code}: ${
            stderr.trim() || stdout.trim()
          }`
        )
      );
    });
  });
}