import "server-only";

import type { NextRequest } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase-server";

export type AuthenticatedCreator = {
  userId: string;
  email: string | null;
};

export async function requireAuthenticatedCreator(
  request: NextRequest,
): Promise<AuthenticatedCreator> {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    throw new Error(
      "Authorization header is required.",
    );
  }

  const match = authorization.match(
    /^Bearer\s+(.+)$/i,
  );

  if (!match) {
    throw new Error(
      "Authorization header must use Bearer authentication.",
    );
  }

  const accessToken = match[1].trim();

  if (!accessToken) {
    throw new Error(
      "Supabase access token is required.",
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(
    accessToken,
  );

  if (error || !user) {
    throw new Error(
      "Authenticated creator session is invalid.",
    );
  }

  return {
    userId: user.id,
    email: user.email ?? null,
  };
}