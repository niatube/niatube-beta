"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type NiaCircleMember = {
  id: string;
  creator_name: string;
  email: string | null;
  category: string;
  bio: string;
  reason: string;
  social_link: string | null;
  status: string;
  created_at: string;
};

export default function AdminNiaCirclePage() {
  const [applications, setApplications] = useState<NiaCircleMember[]>([]);

  async function loadApplications() {
    const { data, error } = await supabase
      .from("niacircle_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("NiaCircle admin load error:", error);
      return;
    }

    setApplications(data || []);
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("niacircle_members")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("NiaCircle status update error:", error);
      return;
    }

    loadApplications();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900">
          NiaCircle Applications
        </h1>

        <p className="mt-2 text-gray-600">
          Review, approve, or reject creator applications for NiaCircle.
        </p>

        <div className="mt-8 space-y-5">
          {applications.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              No NiaCircle applications found.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {app.creator_name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {app.email || "No email provided"} • {app.category}
                    </p>

                    <p className="mt-3 text-sm text-gray-700">
                      <span className="font-bold">Bio:</span> {app.bio}
                    </p>

                    <p className="mt-2 text-sm text-gray-700">
                      <span className="font-bold">Reason:</span> {app.reason}
                    </p>

                    {app.social_link && (
                      <p className="mt-2 text-sm text-gray-700">
                        <span className="font-bold">Link:</span>{" "}
                        <a
                          href={app.social_link}
                          className="text-blue-600 underline"
                          target="_blank"
                        >
                          {app.social_link}
                        </a>
                      </p>
                    )}

                    <p className="mt-3 text-sm font-bold">
                      Status:{" "}
                      <span
                        className={
                          app.status === "approved"
                            ? "text-green-600"
                            : app.status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }
                      >
                        {app.status}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(app.id, "approved")}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(app.id, "rejected")}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}