import type { ModerationEnforcementDecision } from "./content-moderation-enforcement";

export const CONTENT_MODERATION_DETECTOR_NAME =
  "NiaTube Automated Content Moderation";

export const CONTENT_MODERATION_DETECTOR_VERSION = "1.0.0";

export type ContentModerationInput = {
  uploadId: string;
  creatorName: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  bunnyVideoId: string | null;
  isLive: boolean;
};

export type ContentModerationDetectionResult = {
  decision: ModerationEnforcementDecision;
  signals: string[];
};

export async function detectContentModeration(
  input: ContentModerationInput
): Promise<ContentModerationDetectionResult> {
  const searchableText = [
    input.title,
    input.description,
    input.category,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

            const normalizedText = searchableText.toLowerCase();

  const explicitSexualSignals = [
    "explicit pornography",
    "hardcore pornography",
    "sexually explicit content",
    "explicit sexual content",
    "pornographic video",
    "pornographic content",
  ];

  const matchedExplicitSexualSignals =
    explicitSexualSignals.filter((signal) =>
      normalizedText.includes(signal)
    );

  if (matchedExplicitSexualSignals.length > 0) {
    return {
      decision: {
        moderationStatus: "under_review",
        policyCategory: "adult_explicit_sexual_content",
        reason:
          "Automated metadata screening detected language associated with prohibited explicit sexual content.",
        confidence: 0.9,
        detector: CONTENT_MODERATION_DETECTOR_NAME,
        detectorVersion: CONTENT_MODERATION_DETECTOR_VERSION,
        severity: "high",
      },
      signals: matchedExplicitSexualSignals,
    };
  }

          const violentExtremismSignals = [
    "join terrorist organization",
    "support terrorist organization",
    "terrorist propaganda",
    "extremist propaganda",
    "violent extremist propaganda",
    "praise terrorist attack",
    "glorify terrorist attack",
    "support violent extremism",
  ];

  const matchedViolentExtremismSignals =
    violentExtremismSignals.filter((signal) =>
      normalizedText.includes(signal)
    );

  if (matchedViolentExtremismSignals.length > 0) {
    return {
      decision: {
        moderationStatus: "under_review",
        policyCategory: "violent_extremism_hate",
        reason:
          "Automated metadata screening detected language associated with prohibited violent extremist or terrorist content.",
        confidence: 0.9,
        detector: CONTENT_MODERATION_DETECTOR_NAME,
        detectorVersion: CONTENT_MODERATION_DETECTOR_VERSION,
        severity: "critical",
      },
      signals: matchedViolentExtremismSignals,
    };
  }
  if (!searchableText) {
    return {
      decision: {
        moderationStatus: "under_review",
        policyCategory: "insufficient_metadata",
        reason:
          "Content requires review because there is insufficient metadata for automated classification.",
        confidence: null,
        detector: CONTENT_MODERATION_DETECTOR_NAME,
        detectorVersion: CONTENT_MODERATION_DETECTOR_VERSION,
        severity: "medium",
      },
      signals: ["insufficient_metadata"],
    };
  }

    return {
    decision: {
      moderationStatus: "approved",
      policyCategory: "no_policy_violation_detected",
      reason:
        "Automated metadata screening found no prohibited content signals.",
      confidence: 0.8,
      detector: CONTENT_MODERATION_DETECTOR_NAME,
      detectorVersion: CONTENT_MODERATION_DETECTOR_VERSION,
      severity: "low",
    },
    signals: [],
  };
}