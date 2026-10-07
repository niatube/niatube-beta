import { spawn } from "node:child_process";

export function probeMediaFile(filePath, timeoutMs = 60000) {
  if (!filePath?.trim()) {
    return Promise.reject(
      new Error("File path is required for media validation.")
    );
  }

  return new Promise((resolve, reject) => {
    const child = spawn(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=format_name,duration,size:stream=codec_type,codec_name",
        "-of",
        "json",
        filePath,
      ],
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
        new Error(
          `Media validation timed out after ${timeoutMs} milliseconds.`
        )
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
        new Error(`FFprobe executable is unavailable: ${error.message}`)
      );
    });

    child.on("close", (code) => {
      if (settled) return;

      settled = true;
      clearTimeout(timer);

      if (code !== 0) {
        reject(
          new Error(
            `Media validation failed with exit code ${code}: ${
              stderr.trim() || "FFprobe could not recognize the file."
            }`
          )
        );
        return;
      }

      try {
        const metadata = JSON.parse(stdout);

        const formatNames = String(
          metadata?.format?.format_name || ""
        )
          .split(",")
          .map((name) => name.trim().toLowerCase())
          .filter(Boolean);

        if (!formatNames.includes("mp4")) {
          reject(
            new Error(
              `Media validation failed: unsupported container format "${
                metadata?.format?.format_name || "unknown"
              }". Expected an MP4 container.`
            )
          );
          return;
        }

        const hasVideoStream = Array.isArray(metadata.streams)
          && metadata.streams.some(
            (stream) => stream.codec_type === "video"
          );

        if (!hasVideoStream) {
          reject(
            new Error(
              "Media validation failed: no video stream was detected."
            )
          );
          return;
        }

        resolve(metadata);
      } catch {
        reject(
          new Error("Media validation returned invalid FFprobe metadata.")
        );
      }
    });
  });
}
