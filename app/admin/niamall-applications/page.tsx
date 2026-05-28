"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type NiaMallApplication = {
  id: string;
  creator_name: string;
  store_name: string;
  store_url: string;
  promo_video_url?: string;
  category?: string;
  description?: string;
  agreement_accepted?: boolean;
  status?: string;
  reviewed_by?: string;
  review_notes?: string;
  created_at?: string;
};

function isSafeHttpsUrl(url?: string) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function openSafeExternalUrl(url?: string) {
  if (!isSafeHttpsUrl(url)) {
    alert("Blocked unsafe link. Only valid https:// links are allowed.");
    return;
  }

  const confirmed = window.confirm(
    "You are about to open an external website. Only continue if you trust this link."
  );

  if (!confirmed) return;

  window.open(url, "_blank", "noopener,noreferrer");
}

export default function AdminNiaMallApplicationsPage() {
  const [applications, setApplications] = useState<NiaMallApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadApplications() {
    setLoading(true);

    const { data, error } = await supabase
      .from("niamall_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Could not load NiaMALL applications.");
      setLoading(false);
      return;
    }

    setApplications((data || []) as NiaMallApplication[]);
    setLoading(false);
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function approveApplication(application: NiaMallApplication) {
    if (!isSafeHttpsUrl(application.store_url)) {
      alert("Cannot approve: store URL is not a valid https:// link.");
      return;
    }

    if (!isSafeHttpsUrl(application.promo_video_url)) {
      alert("Cannot approve: promo video URL is not a valid https:// link.");
      return;
    }

    const { error } = await supabase
      .from("niamall_applications")
      .update({
        status: "approved",
        reviewed_by: "Admin",
        review_notes: "Approved for NiaMALL listing.",
      })
      .eq("id", application.id);

    if (error) {
      console.error(error);
      alert("Could not approve application.");
      return;
    }

    await supabase.from("notifications").insert([
      {
        creator_name: application.creator_name,
        type: "niamall",
        title: "NiaMALL application approved",
        message: `Your store ${application.store_name} has been approved for NiaMALL listing.`,
      },
    ]);

    setMessage(`Approved ${application.store_name}.`);
    loadApplications();
  }

  async function rejectApplication(application: NiaMallApplication) {
    const { error } = await supabase
      .from("niamall_applications")
      .update({
        status: "rejected",
        reviewed_by: "Admin",
        review_notes: "Application rejected after review.",
      })
      .eq("id", application.id);

    if (error) {
      console.error(error);
      alert("Could not reject application.");
      return;
    }

    await supabase.from("notifications").insert([
      {
        creator_name: application.creator_name,
        type: "niamall",
        title: "NiaMALL application not approved",
        message:
          "Your NiaMALL Revenue Partnership application was not approved. Please review your store/product information and apply again if appropriate.",
      },
    ]);

    setMessage(`Rejected ${application.store_name}.`);
    loadApplications();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Admin Review
        </p>

        <h1 className="mt-2 text-4xl font-black text-gray-900">
          NiaMALL Revenue Partnership Applications
        </h1>

        <p className="mt-3 max-w-3xl text-gray-600">
          Review creator applications before stores, products, or promo videos
          appear publicly on NiaMALL.
        </p>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-black text-red-800">
            External Link Safety
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            Store and promo links are external websites. NiaTube blocks
            non-HTTPS links and asks for confirmation before opening any
            external URL.
          </p>
        </div>

        {message && (
          <p className="mt-6 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-800">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading NiaMALL applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <p className="font-bold text-gray-900">
              No NiaMALL applications yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {applications.map((application) => {
              const storeSafe = isSafeHttpsUrl(application.store_url);
              const promoSafe = isSafeHttpsUrl(application.promo_video_url);

              return (
                <div
                  key={application.id}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-black text-gray-900">
                          {application.store_name}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                            application.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : application.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {application.status || "pending"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-600">
                        Creator: <strong>{application.creator_name}</strong>
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                        <p>
                          <strong>Category:</strong>{" "}
                          {application.category || "Not provided"}
                        </p>

                        <p>
                          <strong>Agreement:</strong>{" "}
                          {application.agreement_accepted
                            ? "Accepted"
                            : "Not accepted"}
                        </p>

                        <p>
                          <strong>Submitted:</strong>{" "}
                          {application.created_at
                            ? new Date(application.created_at).toLocaleString()
                            : "Not available"}
                        </p>

                        <p>
                          <strong>Reviewed By:</strong>{" "}
                          {application.reviewed_by || "Not reviewed"}
                        </p>
                      </div>

                      {application.description && (
                        <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                          {application.description}
                        </p>
                      )}

                      <div className="mt-4 space-y-3 rounded-2xl border bg-gray-50 p-4">
                        <div>
                          <p className="text-xs font-black uppercase text-gray-500">
                            Store URL
                          </p>

                          <p className="mt-1 break-all text-sm text-gray-700">
                            {application.store_url || "Not provided"}
                          </p>

                          <p
                            className={`mt-1 text-xs font-bold ${
                              storeSafe ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {storeSafe
                              ? "HTTPS link passed basic safety check."
                              : "Blocked: invalid or non-HTTPS link."}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase text-gray-500">
                            Promo Video URL
                          </p>

                          <p className="mt-1 break-all text-sm text-gray-700">
                            {application.promo_video_url || "Not provided"}
                          </p>

                          <p
                            className={`mt-1 text-xs font-bold ${
                              promoSafe ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {promoSafe
                              ? "HTTPS link passed basic safety check."
                              : "Blocked: invalid or non-HTTPS link."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openSafeExternalUrl(application.store_url)
                          }
                          disabled={!storeSafe}
                          className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          Open Store Safely
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openSafeExternalUrl(application.promo_video_url)
                          }
                          disabled={!promoSafe}
                          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                        >
                          Open Promo Video Safely
                        </button>
                      </div>

                      {application.review_notes && (
                        <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                          <strong>Review Notes:</strong>{" "}
                          {application.review_notes}
                        </p>
                      )}
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3">
                      <button
                        onClick={() => approveApplication(application)}
                        disabled={
                          application.status === "approved" ||
                          !storeSafe ||
                          !promoSafe
                        }
                        className="rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => rejectApplication(application)}
                        disabled={application.status === "rejected"}
                        className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}