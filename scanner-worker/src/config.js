const REQUIRED_ENV_VARS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "BUNNY_STREAM_LIBRARY_ID",
  "BUNNY_STREAM_API_KEY",
  "BUNNY_CDN_HOSTNAME",
  "BUNNY_CDN_TOKEN_KEY",
];

export function getConfig() {
  const missing = REQUIRED_ENV_VARS.filter(
    (name) => !process.env[name]?.trim()
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return {
    supabaseUrl: process.env.SUPABASE_URL.trim(),
    supabaseServiceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
    bunnyStreamLibraryId:
      process.env.BUNNY_STREAM_LIBRARY_ID.trim(),
    bunnyStreamApiKey:
      process.env.BUNNY_STREAM_API_KEY.trim(),
    bunnyCdnHostname:
      process.env.BUNNY_CDN_HOSTNAME.trim(),
    bunnyCdnTokenKey:
      process.env.BUNNY_CDN_TOKEN_KEY.trim(),
  };
}
