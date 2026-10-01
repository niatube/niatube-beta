import crypto from "node:crypto";

function toBase64Url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createSignedOriginalUrl(
  config,
  videoId,
  expiresInSeconds = 300
) {
  if (!videoId?.trim()) {
    throw new Error("Bunny video ID is required.");
  }

  const hostname = config.bunnyCdnHostname
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  const path = `/${videoId}/original`;
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const signaturePath = path;
  const ipBytes = Buffer.alloc(0);
  const signingData = "";

  const payload = Buffer.concat([
    Buffer.from(signaturePath),
    Buffer.from(String(expires)),
    ipBytes,
    Buffer.from(signingData),
  ]);

  const digest = crypto
    .createHmac("sha256", config.bunnyCdnTokenKey)
    .update(payload)
    .digest();

  const token = `HS256-${toBase64Url(digest)}`;

  return `https://${hostname}${path}?token=${token}&expires=${expires}`;
}
