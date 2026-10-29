
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Creator = {
  id: string;
  creator_name: string;
  email?: string | null;
};

export default function AdminCreatorDashboardPage() {
  const params = useParams<{ id: string }>();
  const creatorId = params.id;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCreator() {
      try {
        const rawAccess = sessionStorage.getItem(
          "niatube_admin_access"
        );

        const access = rawAccess ? JSON.parse(rawAccess) : null;

        const response = await fetch(
          `/api/admin/creators/${encodeURIComponent(creatorId)}/dashboard`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${access?.sessionToken || ""}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(result.error || "Access denied.");
          return;
        }

        setCreator(result.creator);
      } catch {
        setError("Unable to load creator dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadCreator();
  }, [creatorId]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <a
          href="/admin/creators"
          className="text-sm font-semibold text-green-800 underline"
        >
          Back to Creator Directory
        </a>

        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-green-800">
            NiaTube Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Creator Dashboard
          </h1>

          <p className="mt-2 text-sm font-semibold text-amber-700">
            Super Admin — Read-Only Access
          </p>

          {loading && (
            <p className="mt-8 text-gray-600">
              Loading creator information...
            </p>
          )}

          {!loading && error && (
            <p role="alert" className="mt-8 text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && creator && (
            <div className="mt-8 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Creator Name</p>
                <p className="font-semibold text-gray-900">
                  {creator.creator_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">
                  {creator.email || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Creator ID</p>
                <p className="break-all font-mono text-sm text-gray-900">
                  {creatorId}
                </p>
              </div>

              <p className="border-t pt-5 text-sm text-gray-500">
                This administrative view does not permit creator account
                changes, payouts, or financial transactions.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}