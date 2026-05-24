"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type MigrationRequest = {
  id: string;
  creator_name: string;
  platform: string;
  channel_url?: string;
  claimed_subscribers?: number;
  proof_url?: string;
  status?: string;
  reviewed_by?: string;
  review_notes?: string;
  created_at?: string;
};

export default function AdminMigrationRequestsPage() {
  const [requests, setRequests] = useState<MigrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("creator_migration_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Could not load migration requests.");
      setLoading(false);
      return;
    }

    setRequests((data || []) as MigrationRequest[]);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function approveRequest(request: MigrationRequest) {
    const approvedSubscribers = Number(request.claimed_subscribers || 0);

    if (!approvedSubscribers || approvedSubscribers <= 0) {
      alert("Invalid subscriber count.");
      return;
    }

    const { error: profileError } = await supabase
      .from("creator_profiles")
      .update({
        migrated_subscribers: approvedSubscribers,
      })
      .eq("creator_name", request.creator_name);

    if (profileError) {
      console.error(profileError);
      alert("Could not update migrated subscribers.");
      return;
    }

    const { error: requestError } = await supabase
      .from("creator_migration_requests")
      .update({
        status: "approved",
        reviewed_by: "Admin",
        review_notes: `Approved ${approvedSubscribers} migrated subscribers.`,
      })
      .eq("id", request.id);

    if (requestError) {
      console.error(requestError);
      alert("Could not update migration request.");
      return;
    }

    await supabase.from("notifications").insert([
      {
        creator_name: request.creator_name,
        type: "migration",
        title: "Subscriber migration approved",
        message: `Your ${request.platform} subscriber migration was approved for ${approvedSubscribers.toLocaleString()} subscribers.`,
      },
    ]);

    setMessage(
      `Approved ${approvedSubscribers.toLocaleString()} migrated subscribers for ${request.creator_name}.`
    );

    loadRequests();
  }

  async function rejectRequest(request: MigrationRequest) {
    const { error } = await supabase
      .from("creator_migration_requests")
      .update({
        status: "rejected",
        reviewed_by: "Admin",
        review_notes: "Migration request rejected after review.",
      })
      .eq("id", request.id);

    if (error) {
      console.error(error);
      alert("Could not reject migration request.");
      return;
    }

    await supabase.from("notifications").insert([
      {
        creator_name: request.creator_name,
        type: "migration",
        title: "Subscriber migration not approved",
        message:
          "Your subscriber migration request was not approved. Please review your proof and submit again if needed.",
      },
    ]);

    setMessage(`Rejected migration request for ${request.creator_name}.`);
    loadRequests();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Admin Review
        </p>

        <h1 className="mt-2 text-4xl font-black text-gray-900">
          Subscriber Migration Requests
        </h1>

        <p className="mt-3 max-w-3xl text-gray-600">
          Review creator requests to migrate verified subscribers or followers
          from outside platforms into their NiaTube creator profile.
        </p>

        {message && (
          <p className="mt-6 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-800">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading migration requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <p className="font-bold text-gray-900">
              No migration requests yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-black text-gray-900">
                        {request.creator_name}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {request.status || "pending"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                      <p>
                        <strong>Platform:</strong> {request.platform}
                      </p>

                      <p>
                        <strong>Claimed Subscribers:</strong>{" "}
                        {Number(
                          request.claimed_subscribers || 0
                        ).toLocaleString()}
                      </p>

                      <p>
                        <strong>Submitted:</strong>{" "}
                        {request.created_at
                          ? new Date(request.created_at).toLocaleString()
                          : "Not available"}
                      </p>

                      <p>
                        <strong>Reviewed By:</strong>{" "}
                        {request.reviewed_by || "Not reviewed"}
                      </p>
                    </div>

                    {request.channel_url && (
                      <p className="mt-4 text-sm">
                        <strong>Channel URL:</strong>{" "}
                        <a
                          href={request.channel_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-700 hover:underline"
                        >
                          Open channel
                        </a>
                      </p>
                    )}

                    {request.proof_url && (
                      <p className="mt-2 text-sm">
                        <strong>Proof URL:</strong>{" "}
                        <a
                          href={request.proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-700 hover:underline"
                        >
                          Open proof
                        </a>
                      </p>
                    )}

                    {request.review_notes && (
                      <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                        <strong>Review Notes:</strong> {request.review_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex min-w-[220px] flex-col gap-3">
                    <button
                      onClick={() => approveRequest(request)}
                      disabled={request.status === "approved"}
                      className="rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectRequest(request)}
                      disabled={request.status === "rejected"}
                      className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}