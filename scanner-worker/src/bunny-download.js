import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function downloadBunnyOriginal(
  signedUrl,
  workspacePath,
  {
    timeoutMs = 30 * 60 * 1000,
    maxBytes = 10 * 1024 * 1024 * 1024,
  } = {}
) {
  if (!signedUrl?.trim()) {
    throw new Error("Signed Bunny original URL is required.");
  }

  if (!workspacePath?.trim()) {
    throw new Error("Scanner workspace path is required.");
  }

  const destinationPath = path.join(workspacePath, "original");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(signedUrl, {
      method: "GET",
      redirect: "error",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Bunny original download failed with HTTP ${response.status}.`
      );
    }

    const contentLengthHeader = response.headers.get("content-length");

    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);

      if (
        !Number.isFinite(contentLength) ||
        contentLength < 0 ||
        contentLength > maxBytes
      ) {
        throw new Error(
          `Bunny original exceeds the allowed download size.`
        );
      }
    }

    if (!response.body) {
      throw new Error("Bunny original response contained no body.");
    }

    let downloadedBytes = 0;

    const source = Readable.fromWeb(response.body);

    source.on("data", (chunk) => {
      downloadedBytes += chunk.length;

      if (downloadedBytes > maxBytes) {
        controller.abort();
        source.destroy(
          new Error("Bunny original exceeded the allowed download size.")
        );
      }
    });

    await pipeline(
      source,
      fs.createWriteStream(destinationPath, {
        flags: "wx",
      })
    );

    return {
      filePath: destinationPath,
      bytes: downloadedBytes,
      contentType: response.headers.get("content-type"),
    };
  } catch (error) {
    await fsPromises.rm(destinationPath, {
      force: true,
    });

    if (error?.name === "AbortError") {
      throw new Error(
        `Bunny original download timed out after ${timeoutMs} milliseconds.`
      );
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}
