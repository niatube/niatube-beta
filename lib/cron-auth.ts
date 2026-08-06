import { NextResponse } from "next/server";

export type CronAuthorizationResult = {
  success: boolean;
  error?: string;
};

export function authorizeCronRequest(
  request: Request,
): CronAuthorizationResult {
  const cronSecret =
    process.env.CRON_SECRET;

  if (!cronSecret) {
    throw new Error(
      "CRON_SECRET environment variable is not configured.",
    );
  }

  const authorizationHeader =
    request.headers.get("authorization");

  if (!authorizationHeader) {
    return {
      success: false,
      error: "Missing Authorization header.",
    };
  }

  if (
    !authorizationHeader.startsWith(
      "Bearer ",
    )
  ) {
    return {
      success: false,
      error:
        "Authorization header must use the Bearer scheme.",
    };
  }

  const token =
    authorizationHeader.slice(7).trim();

  if (token !== cronSecret) {
    return {
      success: false,
      error: "Invalid cron authorization token.",
    };
  }

  return {
    success: true,
  };
}

export function unauthorizedCronResponse(
  message: string,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 401,
    },
  );
}