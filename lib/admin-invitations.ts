// lib/admin-invitations.ts

import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const INVITATION_CODE_PREFIX = "NTA";
const INVITATION_SEGMENT_LENGTH = 4;
const INVITATION_SEGMENT_COUNT = 3;

export const ADMIN_INVITATION_VALIDITY_DAYS = 30;

export type GeneratedAdminInvitationCode = {
  code: string;
  codeHash: string;
  codePrefix: string;
};

function normalizeInvitationCode(value: string): string {
  return value.trim().toUpperCase();
}

function createSecureSegment(length: number): string {
  /*
   * Characters that are easily confused have been excluded:
   * 0, O, 1, I, and L.
   */
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

  let segment = "";

  while (segment.length < length) {
    const randomValue = randomBytes(1)[0];

    /*
     * Avoid modulo bias by accepting only byte values that divide
     * evenly across the alphabet's character range.
     */
    const maximumAcceptableValue =
      Math.floor(256 / alphabet.length) * alphabet.length;

    if (randomValue >= maximumAcceptableValue) {
      continue;
    }

    segment += alphabet[randomValue % alphabet.length];
  }

  return segment;
}

export function hashAdminInvitationCode(code: string): string {
  const normalizedCode = normalizeInvitationCode(code);

  return createHash("sha256")
    .update(normalizedCode, "utf8")
    .digest("hex");
}

export function generateAdminInvitationCode():
  GeneratedAdminInvitationCode {
  const segments = Array.from(
    { length: INVITATION_SEGMENT_COUNT },
    () => createSecureSegment(INVITATION_SEGMENT_LENGTH),
  );

  const code = [
    INVITATION_CODE_PREFIX,
    ...segments,
  ].join("-");

  return {
    code,
    codeHash: hashAdminInvitationCode(code),
    codePrefix: `${INVITATION_CODE_PREFIX}-${segments[0]}`,
  };
}

export function verifyAdminInvitationCode(
  submittedCode: string,
  storedCodeHash: string,
): boolean {
  if (!submittedCode || !storedCodeHash) {
    return false;
  }

  const submittedHash = hashAdminInvitationCode(submittedCode);

  const submittedHashBuffer = Buffer.from(
    submittedHash,
    "hex",
  );

  const storedHashBuffer = Buffer.from(
    storedCodeHash,
    "hex",
  );

  if (
    submittedHashBuffer.length !==
    storedHashBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    submittedHashBuffer,
    storedHashBuffer,
  );
}

export function resolveInvitationExpiration(): Date {
  return new Date(
    Date.now() +
      ADMIN_INVITATION_VALIDITY_DAYS *
        24 *
        60 *
        60 *
        1000,
  );
}
export function isAdminInvitationExpired(
  expiresAt: string | Date,
): boolean {
  const expirationDate =
    expiresAt instanceof Date
      ? expiresAt
      : new Date(expiresAt);

  return (
    Number.isNaN(expirationDate.getTime()) ||
    expirationDate.getTime() <= Date.now()
  );
}