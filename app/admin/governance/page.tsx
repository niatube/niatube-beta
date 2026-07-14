"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type GovernanceReport = {
  id: string;
  report_type: string;
  creator_name?: string | null;
  channel_handle?: string | null;
  video_id?: string | null;
  status: string;
  priority: string;
  description: string;
  assigned_to?: string | null;
  created_at: string;
};

type GovernanceAppeal = {
  id: string;
  creator_name: string;
  channel_handle?: string | null;
  status: string;
  appeal_reason: string;
  reviewed_by?: string | null;
  created_at: string;
};

type GovernanceAction = {
  id: string;
  creator_name: string;
  channel_handle?: string | null;
  action_type: string;
  action_reason: string;
  severity: string;
  performed_by: string;
  created_at: string;
};

type AuditLogItem = {
  id: string;
  event_type: string;
  actor: string;
  actor_role?: string | null;
  target_type: string;
  target_id?: string | null;
  target_creator_name?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
};

type SuspendedCreator = {
  id: string;
  creator_name: string;
  channel_handle?: string | null;
  account_status?: string | null;
  governance_status?: string | null;
  suspension_until?: string | null;
};

type CreatorMonitoringItem = {
  id: string;
  creator_name: string;
  channel_handle?: string | null;
  country?: string | null;
  account_status?: string | null;
  governance_status?: string | null;
  active_strikes?: number | null;
  last_warning_at?: string | null;
  last_governance_review_at?: string | null;
  suspension_until?: string | null;
  created_at?: string | null;
};

export default function GovernanceOperationsPage() {
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reports, setReports] = useState<GovernanceReport[]>([]);
  const [appeals, setAppeals] = useState<GovernanceAppeal[]>([]);
  const [actions, setActions] = useState<GovernanceAction[]>([]);
 const [auditLog, setAuditLog] = useState<AuditLogItem[]>([]);

const [suspendedCreators, setSuspendedCreators] = useState<
  SuspendedCreator[]
>([]);



const [creatorMonitoring, setCreatorMonitoring] = useState<
  CreatorMonitoringItem[]
>([]);
  

  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const rawAccess = sessionStorage.getItem("niatube_admin_access");

    if (!rawAccess) {
      setHasAccess(false);
      setAccessChecked(true);
      setLoading(false);
      return;
    }

    try {
      const access = JSON.parse(rawAccess);
      const expiresAt = access?.expiresAt
        ? new Date(access.expiresAt)
        : null;

      const allowedPath = access?.redirectPath;

      if (
        !access?.sessionToken ||
        !expiresAt ||
        expiresAt < new Date() ||
        allowedPath !== "/admin"
      ) {
        sessionStorage.removeItem("niatube_admin_access");
        setHasAccess(false);
        setAccessChecked(true);
        setLoading(false);
        return;
      }

      setHasAccess(true);
      setAccessChecked(true);
    } catch {
      sessionStorage.removeItem("niatube_admin_access");
      setHasAccess(false);
      setAccessChecked(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasAccess) return;

    async function loadGovernanceCenter() {
      setLoading(true);
      setLoadError("");

      const [
  reportsResult,
  appealsResult,
  actionsResult,
  auditResult,
  suspendedResult,
  creatorMonitoringResult,
] = await Promise.all([
      
       supabase
          .from("creator_reports")
          .select(
            "id, report_type, creator_name, channel_handle, video_id, status, priority, description, assigned_to, created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("creator_appeals")
          .select(
            "id, creator_name, channel_handle, status, appeal_reason, reviewed_by, created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("creator_governance_actions")
          .select(
            "id, creator_name, channel_handle, action_type, action_reason, severity, performed_by, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(20),

        supabase
          .from("governance_audit_log")
          .select(
            "id, event_type, actor, actor_role, target_type, target_id, target_creator_name, details, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(20),

        supabase
          .from("creator_profiles")
          .select(
            "id, creator_name, channel_handle, account_status, governance_status, suspension_until"
          )
          .or(
            "account_status.eq.suspended,account_status.eq.terminated,governance_status.eq.suspended,governance_status.eq.terminated"
          )
          .order("creator_name", { ascending: true }),

          supabase
  .from("creator_profiles")
  .select(
    "id, creator_name, channel_handle, country, account_status, governance_status, active_strikes, last_warning_at, last_governance_review_at, suspension_until, created_at"
  )
  .order("created_at", { ascending: false }),
      ]);

     const errors = [
  reportsResult.error,
  appealsResult.error,
  actionsResult.error,
  auditResult.error,
  suspendedResult.error,
  creatorMonitoringResult.error,
].filter(Boolean);

      if (errors.length > 0) {
        console.error("Governance dashboard load errors:", errors);
        setLoadError(
          "Some governance information could not be loaded. Please review the browser console and Supabase permissions."
        );
      }

      setReports(
        (reportsResult.data || []) as GovernanceReport[]
      );

      setAppeals(
        (appealsResult.data || []) as GovernanceAppeal[]
      );

      setActions(
        (actionsResult.data || []) as GovernanceAction[]
      );

      setAuditLog(
        (auditResult.data || []) as AuditLogItem[]
      );

      setSuspendedCreators(
        (suspendedResult.data || []) as SuspendedCreator[]
      );

      setCreatorMonitoring(
  (creatorMonitoringResult.data || []) as CreatorMonitoringItem[]
);

      setLoading(false);
    }

    loadGovernanceCenter();
  }, [hasAccess]);

  async function updateReportStatus(
  report: GovernanceReport,
  nextStatus: string
) {
  const rawAccess = sessionStorage.getItem("niatube_admin_access");

  let actor = "Governance Administrator";

  if (rawAccess) {
    try {
      const access = JSON.parse(rawAccess);
      actor = access?.codeName || actor;
    } catch {
      // Keep the default actor name.
    }
  }

  const now = new Date().toISOString();

  const updatePayload: Record<string, string | null> = {
    status: nextStatus,
    reviewed_at: now,
  };

  if (nextStatus === "resolved" || nextStatus === "dismissed") {
    updatePayload.resolved_at = now;
  } else {
    updatePayload.resolved_at = null;
  }

  const { error: reportError } = await supabase
    .from("creator_reports")
    .update(updatePayload)
    .eq("id", report.id);

  if (reportError) {
    console.error("Report status update error:", reportError);
    alert(`Could not update report: ${reportError.message}`);
    return;
  }

  const { error: auditError } = await supabase
    .from("governance_audit_log")
    .insert([
      {
        event_type: `report_${nextStatus}`,
        actor,
        actor_role: "Creator Governance & Trust",
        target_type: "creator_report",
        target_id: report.id,
        target_creator_name: report.creator_name || null,
        details: {
          report_type: report.report_type,
          previous_status: report.status,
          new_status: nextStatus,
          priority: report.priority,
          channel_handle: report.channel_handle,
          video_id: report.video_id,
        },
      },
    ]);

  if (auditError) {
    console.error("Governance audit log error:", auditError);
    alert(
      "The report was updated, but its audit record could not be saved."
    );
  }

  setReports((currentReports) =>
    currentReports.map((currentReport) =>
      currentReport.id === report.id
        ? {
            ...currentReport,
            status: nextStatus,
          }
        : currentReport
    )
  );

  alert(
    `Report status changed to ${nextStatus.replace(/_/g, " ")}.`
  );
}

async function assignReportReviewer(report: GovernanceReport) {
  const reviewerName = window.prompt(
    "Enter the name or role of the governance reviewer:",
    report.assigned_to || ""
  );

  if (!reviewerName?.trim()) {
    return;
  }

  const cleanReviewerName = reviewerName.trim();

  const rawAccess = sessionStorage.getItem("niatube_admin_access");

  let actor = "Governance Administrator";

  if (rawAccess) {
    try {
      const access = JSON.parse(rawAccess);
      actor = access?.codeName || actor;
    } catch {
      // Keep the default actor name.
    }
  }

  const { error: assignmentError } = await supabase
    .from("creator_reports")
    .update({
      assigned_to: cleanReviewerName,
      status:
        report.status === "open"
          ? "under_review"
          : report.status,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", report.id);

  if (assignmentError) {
    console.error("Report assignment error:", assignmentError);
    alert(`Could not assign report: ${assignmentError.message}`);
    return;
  }

  const { error: auditError } = await supabase
    .from("governance_audit_log")
    .insert([
      {
        event_type: "report_assigned",
        actor,
        actor_role: "Creator Governance & Trust",
        target_type: "creator_report",
        target_id: report.id,
        target_creator_name: report.creator_name || null,
        details: {
          report_type: report.report_type,
          assigned_to: cleanReviewerName,
          previous_assignee: report.assigned_to,
          previous_status: report.status,
          new_status:
            report.status === "open"
              ? "under_review"
              : report.status,
        },
      },
    ]);

  if (auditError) {
    console.error("Governance audit log error:", auditError);
    alert(
      "The reviewer was assigned, but the audit record could not be saved."
    );
  }

  setReports((currentReports) =>
    currentReports.map((currentReport) =>
      currentReport.id === report.id
        ? {
            ...currentReport,
            assigned_to: cleanReviewerName,
            status:
              currentReport.status === "open"
                ? "under_review"
                : currentReport.status,
          }
        : currentReport
    )
  );

  alert(`Report assigned to ${cleanReviewerName}.`);
}

  const openReports = useMemo(
    () =>
      reports.filter((report) =>
        ["open", "escalated"].includes(
          String(report.status || "").toLowerCase()
        )
      ),
    [reports]
  );

  const reportsUnderReview = useMemo(
    () =>
      reports.filter(
        (report) =>
          String(report.status || "").toLowerCase() ===
          "under_review"
      ),
    [reports]
  );

  const activeAppeals = useMemo(
    () =>
      appeals.filter((appeal) =>
        [
          "submitted",
          "under_review",
          "additional_information_requested",
        ].includes(String(appeal.status || "").toLowerCase())
      ),
    [appeals]
  );

  const urgentReports = useMemo(
    () =>
      reports.filter((report) =>
        ["high", "urgent"].includes(
          String(report.priority || "").toLowerCase()
        )
      ),
    [reports]
  );

  if (!accessChecked) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <p className="text-sm font-bold text-gray-600">
          Checking governance access...
        </p>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-gray-900">
            Governance Access Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Enter the authorized Admin access code before opening the
            Creator Governance &amp; Trust Center.
          </p>

          <Link
            href="/admin/access"
            className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
          >
            Enter Admin Code
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-purple-700">
              Governance Operations
            </p>

            <h1 className="mt-2 text-4xl font-black text-gray-900">
              Creator Governance &amp; Trust Center
            </h1>

            <div className="mt-6 flex flex-wrap gap-3">
  <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-800">
    Overview
  </span>

  <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700">
    Creator Monitoring
  </span>

  <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700">
    Reports
  </span>

  <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700">
    Appeals
  </span>

  <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700">
    Audit Log
  </span>
</div>

            <p className="mt-3 max-w-3xl leading-7 text-gray-600">
              Monitor creator standing, review reports, supervise
              enforcement actions, manage appeals, and preserve a clear
              governance audit trail.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-black text-gray-700 hover:bg-gray-100"
          >
            ← Admin Control Center
          </Link>
        </div>

        {loadError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-800">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <p className="font-bold text-gray-600">
              Loading governance operations...
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <MetricCard
                title="Open Reports"
                value={openReports.length}
                description="Awaiting assessment"
              />

              <MetricCard
                title="Under Review"
                value={reportsUnderReview.length}
                description="Currently being reviewed"
              />

              <MetricCard
                title="Urgent Reports"
                value={urgentReports.length}
                description="High or urgent priority"
              />

              <MetricCard
                title="Active Appeals"
                value={activeAppeals.length}
                description="Awaiting resolution"
              />

              <MetricCard
                title="Suspended Creators"
                value={suspendedCreators.length}
                description="Restricted or terminated"
              />

              <MetricCard
                title="Governance Actions"
                value={actions.length}
                description="Recent recorded actions"
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
             <GovernancePanel
  title="Reports Management"
  description="Review incoming creator and content reports, prioritize urgent cases, and track governance decisions."
>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <MetricCard
      title="Open"
      value={
        reports.filter(
          (report) =>
            String(report.status || "").toLowerCase() === "open"
        ).length
      }
      description="Awaiting initial review"
    />

    <MetricCard
      title="Under Review"
      value={
        reports.filter(
          (report) =>
            String(report.status || "").toLowerCase() ===
            "under_review"
        ).length
      }
      description="Currently being assessed"
    />

    <MetricCard
      title="Escalated"
      value={
        reports.filter(
          (report) =>
            String(report.status || "").toLowerCase() ===
            "escalated"
        ).length
      }
      description="Requires senior attention"
    />

    <MetricCard
      title="Resolved"
      value={
        reports.filter(
          (report) =>
            String(report.status || "").toLowerCase() ===
            "resolved"
        ).length
      }
      description="Governance action completed"
    />

    <MetricCard
      title="Dismissed"
      value={
        reports.filter(
          (report) =>
            String(report.status || "").toLowerCase() ===
            "dismissed"
        ).length
      }
      description="Closed without enforcement"
    />

    <MetricCard
      title="Urgent"
      value={
        reports.filter(
          (report) =>
            String(report.priority || "").toLowerCase() ===
            "urgent"
        ).length
      }
      description="Immediate attention required"
    />
  </div>

  <div className="mt-8 overflow-x-auto">
    <table className="w-full min-w-[1050px] text-left text-sm">
      <thead>
        <tr className="border-b text-gray-500">
          <th className="py-3 pr-4">Report Type</th>
          <th className="py-3 pr-4">Creator</th>
          <th className="py-3 pr-4">Handle</th>
          <th className="py-3 pr-4">Status</th>
          <th className="py-3 pr-4">Priority</th>
          <th className="py-3 pr-4">Assigned To</th>
          <th className="py-3 pr-4">Submitted</th>
          <th className="py-3 pr-4">Governance Actions</th>
        </tr>
      </thead>

      <tbody>
        {reports.length === 0 ? (
          <tr>
            <td
              colSpan={8}
              className="py-10 text-center font-semibold text-gray-500"
            >
              No creator reports have been submitted.
            </td>
          </tr>
        ) : (
          reports.map((report) => (
            <tr
              key={report.id}
              className="border-b align-top last:border-b-0"
            >
              <td className="py-4 pr-4">
                <p className="font-black capitalize text-gray-900">
                  {report.report_type.replace(/_/g, " ")}
                </p>

                <p className="mt-1 max-w-xs line-clamp-2 text-xs leading-5 text-gray-500">
                  {report.description}
                </p>
              </td>

              <td className="py-4 pr-4 font-bold text-gray-900">
                {report.creator_name || "Unknown creator"}
              </td>

              <td className="py-4 pr-4 text-gray-700">
                {report.channel_handle
                  ? `@${report.channel_handle}`
                  : "Not available"}
              </td>

              <td className="py-4 pr-4">
                <StatusBadge value={report.status} />
              </td>

              <td className="py-4 pr-4">
                <PriorityBadge value={report.priority} />
              </td>

              <td className="py-4 pr-4 text-gray-700">
                {report.assigned_to || "Unassigned"}
              </td>

              <td className="py-4 pr-4 text-gray-700">
                {new Date(report.created_at).toLocaleString()}
              </td>

            <td className="py-4 pr-4">
  <div className="flex min-w-[260px] flex-wrap gap-2">
    <button
      type="button"
      onClick={() => assignReportReviewer(report)}
      className="rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-xs font-black text-purple-800 hover:bg-purple-100"
    >
      Assign
    </button>

    <button
      type="button"
      onClick={() =>
        updateReportStatus(report, "under_review")
      }
      disabled={report.status === "under_review"}
      className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Review
    </button>

    <button
      type="button"
      onClick={() => updateReportStatus(report, "escalated")}
      disabled={report.status === "escalated"}
      className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-black text-orange-800 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Escalate
    </button>

    <button
      type="button"
      onClick={() => updateReportStatus(report, "resolved")}
      disabled={report.status === "resolved"}
      className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs font-black text-green-800 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Resolve
    </button>

    <button
      type="button"
      onClick={() => updateReportStatus(report, "dismissed")}
      disabled={report.status === "dismissed"}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Dismiss
    </button>

    <button
      type="button"
      onClick={() =>
        alert(
          [
            `Report type: ${report.report_type.replace(
              /_/g,
              " "
            )}`,
            `Creator: ${
              report.creator_name || "Unknown creator"
            }`,
            `Handle: ${
              report.channel_handle
                ? `@${report.channel_handle}`
                : "Not available"
            }`,
            `Status: ${report.status}`,
            `Priority: ${report.priority}`,
            `Assigned to: ${
              report.assigned_to || "Unassigned"
            }`,
            "",
            report.description,
          ].join("\n")
        )
      }
      className="rounded-lg bg-black px-3 py-2 text-xs font-black text-white hover:bg-gray-800"
    >
      Details
    </button>
  </div>
</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</GovernancePanel>

              <GovernancePanel
                title="Active Appeals"
                description="Creator appeals awaiting governance review."
              >
                {activeAppeals.length === 0 ? (
                  <EmptyState message="No active appeals are awaiting review." />
                ) : (
                  <div className="space-y-4">
                    {activeAppeals.slice(0, 8).map((appeal) => (
                      <div
                        key={appeal.id}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                              Appeal
                            </p>

                            <h3 className="mt-1 text-lg font-black text-gray-900">
                              {appeal.creator_name}
                            </h3>
                          </div>

                          <StatusBadge value={appeal.status} />
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-700">
                          {appeal.appeal_reason}
                        </p>

                        <p className="mt-3 text-xs font-semibold text-gray-500">
                          Submitted{" "}
                          {new Date(
                            appeal.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </GovernancePanel>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <GovernancePanel
                title="Suspended or Terminated Creators"
                description="Channels currently subject to serious governance restrictions."
              >
                {suspendedCreators.length === 0 ? (
                  <EmptyState message="No creators are currently suspended or terminated." />
                ) : (
                  <div className="space-y-4">
                    {suspendedCreators.map((creator) => (
                      <div
                        key={creator.id}
                        className="rounded-2xl border border-red-200 bg-red-50 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-black text-gray-900">
                              {creator.creator_name}
                            </h3>

                            <p className="mt-1 text-sm font-semibold text-gray-600">
                              {creator.channel_handle
                                ? `@${creator.channel_handle}`
                                : "No channel handle"}
                            </p>
                          </div>

                          <StatusBadge
                            value={
                              creator.governance_status ||
                              creator.account_status ||
                              "suspended"
                            }
                          />
                        </div>

                        <p className="mt-3 text-xs font-semibold text-gray-600">
                          Suspension until:{" "}
                          {creator.suspension_until
                            ? new Date(
                                creator.suspension_until
                              ).toLocaleString()
                            : "Indefinite"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </GovernancePanel>

              <GovernancePanel
                title="Recent Governance Actions"
                description="Latest enforcement and trust actions recorded by governance operations."
              >
                {actions.length === 0 ? (
                  <EmptyState message="No governance actions have been recorded." />
                ) : (
                  <div className="space-y-4">
                    {actions.slice(0, 8).map((action) => (
                      <div
                        key={action.id}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-gray-500">
                              {action.action_type.replace(/_/g, " ")}
                            </p>

                            <h3 className="mt-1 text-lg font-black text-gray-900">
                              {action.creator_name}
                            </h3>
                          </div>

                          <SeverityBadge value={action.severity} />
                        </div>

                        <p className="mt-3 text-sm leading-6 text-gray-700">
                          {action.action_reason}
                        </p>

                        <p className="mt-3 text-xs font-semibold text-gray-500">
                          By {action.performed_by} •{" "}
                          {new Date(
                            action.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </GovernancePanel>
            </div>

                      <div className="mt-8">
              <GovernancePanel
                title="Recent Governance Audit Activity"
                description="Immutable operational history for accountability and institutional memory."
              >
                {auditLog.length === 0 ? (
                  <EmptyState message="No audit events have been recorded." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                      <thead>
                        <tr className="border-b text-gray-500">
                          <th className="py-3 pr-4">Date</th>
                          <th className="py-3 pr-4">Event</th>
                          <th className="py-3 pr-4">Actor</th>
                          <th className="py-3 pr-4">Target</th>
                          <th className="py-3 pr-4">Creator</th>
                        </tr>
                      </thead>

                      <tbody>
                        {auditLog.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b last:border-b-0"
                          >
                            <td className="py-4 pr-4 text-gray-700">
                              {new Date(item.created_at).toLocaleString()}
                            </td>

                            <td className="py-4 pr-4 font-black text-gray-900">
                              {item.event_type.replace(/_/g, " ")}
                            </td>

                            <td className="py-4 pr-4 text-gray-700">
                              {item.actor}
                              {item.actor_role
                                ? ` (${item.actor_role})`
                                : ""}
                            </td>

                            <td className="py-4 pr-4 text-gray-700">
                              {item.target_type}
                            </td>

                            <td className="py-4 pr-4 font-semibold text-gray-900">
                              {item.target_creator_name || "Not specified"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GovernancePanel>
            </div>

            <div className="mt-8">
              <GovernancePanel
                title="Creator Monitoring"
                description="Monitor creator standing across the platform and identify creators requiring governance attention."
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="py-3 pr-4">Creator</th>
                        <th className="py-3 pr-4">Handle</th>
                        <th className="py-3 pr-4">
                          Governance Status
                        </th>
                        <th className="py-3 pr-4">Warnings</th>
                        <th className="py-3 pr-4">Strikes</th>
                        <th className="py-3 pr-4">Last Review</th>
                        <th className="py-3 pr-4">Attention</th>
                      </tr>
                    </thead>

                    <tbody>
                      {creatorMonitoring.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-10 text-center font-semibold text-gray-500"
                          >
                            No creators are available for monitoring.
                          </td>
                        </tr>
                      ) : (
                        creatorMonitoring.map((creator) => {
                          const governanceStatus = String(
                            creator.governance_status || "active"
                          )
                            .toLowerCase()
                            .trim();

                          const accountStatus = String(
                            creator.account_status || "active"
                          )
                            .toLowerCase()
                            .trim();

                          const strikes = Number(
                            creator.active_strikes || 0
                          );

                          const attentionLevel =
                            accountStatus === "terminated" ||
                            governanceStatus === "terminated"
                              ? "Immediate Action"
                              : accountStatus === "suspended" ||
                                governanceStatus === "suspended" ||
                                strikes >= 3
                              ? "Immediate Action"
                              : accountStatus === "restricted" ||
                                governanceStatus === "restricted" ||
                                strikes === 2
                              ? "Review"
                              : governanceStatus === "warning" ||
                                strikes === 1 ||
                                creator.last_warning_at
                              ? "Monitor"
                              : "Normal";

                          const attentionClasses =
                            attentionLevel === "Immediate Action"
                              ? "bg-red-100 text-red-800"
                              : attentionLevel === "Review"
                              ? "bg-orange-100 text-orange-800"
                              : attentionLevel === "Monitor"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800";

                          return (
                            <tr
                              key={creator.id}
                              className="border-b last:border-b-0"
                            >
                              <td className="py-4 pr-4">
                                <p className="font-black text-gray-900">
                                  {creator.creator_name}
                                </p>

                                <p className="mt-1 text-xs font-semibold text-gray-500">
                                  {creator.country ||
                                    "Country not set"}
                                </p>
                              </td>

                              <td className="py-4 pr-4 font-semibold text-gray-700">
                                {creator.channel_handle
                                  ? `@${creator.channel_handle}`
                                  : "No handle"}
                              </td>

                              <td className="py-4 pr-4">
                                <StatusBadge
                                  value={governanceStatus}
                                />
                              </td>

                              <td className="py-4 pr-4 text-gray-700">
                                {creator.last_warning_at ? "1+" : "0"}
                              </td>

                              <td className="py-4 pr-4 font-black text-gray-900">
                                {strikes}
                              </td>

                              <td className="py-4 pr-4 text-gray-700">
                                {creator.last_governance_review_at
                                  ? new Date(
                                      creator.last_governance_review_at
                                    ).toLocaleString()
                                  : "Never reviewed"}
                              </td>

                              <td className="py-4 pr-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-black ${attentionClasses}`}
                                >
                                  {attentionLevel}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </GovernancePanel>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-gray-500">{title}</p>

      <p className="mt-2 text-3xl font-black text-gray-900">
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-xs font-semibold text-gray-500">
        {description}
      </p>
    </div>
  );
}

function GovernancePanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-gray-900">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}
function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm font-semibold text-gray-500">
      {message}
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const normalized = String(value || "unknown")
    .toLowerCase()
    .trim();

  const classes =
    normalized === "resolved" ||
    normalized === "approved" ||
    normalized === "active"
      ? "bg-green-100 text-green-800"
      : normalized === "dismissed" ||
        normalized === "rejected" ||
        normalized === "terminated"
      ? "bg-red-100 text-red-800"
      : normalized === "under_review"
      ? "bg-blue-100 text-blue-800"
      : normalized === "suspended" ||
        normalized === "restricted"
      ? "bg-orange-100 text-orange-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black capitalize ${classes}`}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
}

function PriorityBadge({ value }: { value: string }) {
  const normalized = String(value || "normal")
    .toLowerCase()
    .trim();

  const classes =
    normalized === "urgent"
      ? "bg-red-600 text-white"
      : normalized === "high"
      ? "bg-orange-100 text-orange-800"
      : normalized === "low"
      ? "bg-gray-100 text-gray-700"
      : "bg-blue-100 text-blue-800";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black capitalize ${classes}`}
    >
      {normalized}
    </span>
  );
}

function SeverityBadge({ value }: { value: string }) {
  const normalized = String(value || "low")
    .toLowerCase()
    .trim();

  const classes =
    normalized === "critical"
      ? "bg-red-600 text-white"
      : normalized === "high"
      ? "bg-red-100 text-red-800"
      : normalized === "medium"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black capitalize ${classes}`}
    >
      {normalized}
    </span>
  );
}