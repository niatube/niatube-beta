export type ContentModerationStatus =
  | "pending"
  | "legacy_unreviewed"
  | "approved"
  | "under_review"
  | "blocked"
  | "removed";

export type PublicationDecision = {
  allowed: boolean;
  moderationStatus: ContentModerationStatus | null;
  reason: string;
};

export function getPublicationDecision(
  moderationStatus: string | null | undefined
): PublicationDecision {
 if (
  moderationStatus === "approved" ||
  moderationStatus === "legacy_unreviewed"
) {
  return {
    allowed: true,
    moderationStatus,
    reason:
      moderationStatus === "approved"
        ? "Content has been approved by the moderation system."
        : "Legacy content remains eligible for publication under the migration policy.",
  };
}

  const knownStatuses: ContentModerationStatus[] = [
    "pending",
    "legacy_unreviewed",
    "under_review",
    "blocked",
    "removed",
  ];

  const normalizedStatus =
    moderationStatus &&
    knownStatuses.includes(moderationStatus as ContentModerationStatus)
      ? (moderationStatus as ContentModerationStatus)
      : null;

  return {
    allowed: false,
    moderationStatus: normalizedStatus,
    reason:
      normalizedStatus === null
        ? "Content moderation status is missing or invalid."
        : `Content cannot be published while moderation status is ${normalizedStatus}.`,
  };
}

export type ModerationEnforcementDecision = {
  moderationStatus: "approved" | "under_review" | "blocked" | "removed";
  policyCategory: string;
  reason: string;
  confidence: number | null;
  detector: string;
  detectorVersion: string;
  severity: "low" | "medium" | "high" | "critical";
};

type EnforceModerationDecisionRequest = {
  supabaseAdmin: any;
  uploadId: string;
  creatorName: string;
  decision: ModerationEnforcementDecision;
};

export async function enforceModerationDecision({
  supabaseAdmin,
  uploadId,
  creatorName,
  decision,
}: EnforceModerationDecisionRequest) {
  const moderationUpdatedAt = new Date().toISOString();

  const shouldDisableMonetization =
    decision.moderationStatus !== "approved";

  const shouldRemoveFromPublication =
    decision.moderationStatus === "blocked" ||
    decision.moderationStatus === "removed";

  const uploadUpdate: Record<string, unknown> = {
    moderation_status: decision.moderationStatus,
    moderation_reason: decision.reason,
    moderation_policy_category: decision.policyCategory,
    moderation_confidence: decision.confidence,
    moderation_detector: decision.detector,
    moderation_detector_version: decision.detectorVersion,
    moderation_reviewed_at: moderationUpdatedAt,
    moderation_updated_at: moderationUpdatedAt,
  };

  if (shouldDisableMonetization) {
    uploadUpdate.monetization_status = "disabled";
    uploadUpdate.monetization_disabled_reason = decision.reason;
  }

  if (shouldRemoveFromPublication) {
    uploadUpdate.status = "processing";
  }

  const { error: uploadError } = await supabaseAdmin
    .from("uploads")
    .update(uploadUpdate)
    .eq("id", uploadId);

  if (uploadError) {
    throw new Error(
      `Failed to update upload moderation state: ${uploadError.message}`
    );
  }

  const { error: actionError } = await supabaseAdmin
    .from("creator_governance_actions")
    .insert([
      {
        creator_name: creatorName,
        action_type: `automated_moderation_${decision.moderationStatus}`,
        action_reason: decision.reason,
        severity: decision.severity,
        performed_by: "NiaTube Automated Moderation",
        related_video_id: uploadId,
        notes: `Policy category: ${decision.policyCategory}; detector: ${decision.detector}; version: ${decision.detectorVersion}`,
      },
    ]);

  if (actionError) {
    throw new Error(
      `Failed to record governance action: ${actionError.message}`
    );
  }

  const { error: auditError } = await supabaseAdmin
    .from("governance_audit_log")
    .insert([
      {
        event_type: "automated_content_moderation",
        actor: "NiaTube Automated Moderation",
        actor_role: "Automated Safety System",
        target_type: "upload",
        target_id: uploadId,
        target_creator_name: creatorName,
        details: {
          moderation_status: decision.moderationStatus,
          policy_category: decision.policyCategory,
          reason: decision.reason,
          confidence: decision.confidence,
          detector: decision.detector,
          detector_version: decision.detectorVersion,
          severity: decision.severity,
          monetization_disabled: shouldDisableMonetization,
          removed_from_publication: shouldRemoveFromPublication,
        },
      },
    ]);

  if (auditError) {
    throw new Error(
      `Failed to record governance audit event: ${auditError.message}`
    );
  }

  return {
    uploadId,
    moderationStatus: decision.moderationStatus,
    monetizationDisabled: shouldDisableMonetization,
    removedFromPublication: shouldRemoveFromPublication,
  };
}