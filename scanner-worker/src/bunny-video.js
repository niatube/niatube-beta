export async function getBunnyVideoStatus(
  config,
  videoId,
  timeoutMs = 30000
) {
  if (!videoId?.trim()) {
    throw new Error("Bunny video ID is required.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${config.bunnyStreamLibraryId}/videos/${videoId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          AccessKey: config.bunnyStreamApiKey,
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Bunny video status request failed with HTTP ${response.status}.`
      );
    }

    const video = await response.json();
    const status = Number(video?.status ?? video?.Status);

    return {
      ready: status === 4,
      status,
      availableResolutions:
        video?.availableResolutions ??
        video?.AvailableResolutions ??
        null,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        `Bunny video status request timed out after ${timeoutMs} milliseconds.`
      );
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}
