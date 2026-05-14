"use client";

import { useEffect, useState } from "react";

type Upload = {
  id: string;
  title: string;
  creator: string;
  status: string;
  created_at: string;
};

export default function CreatorDashboardPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);

  const fetchUploads = async () => {
    const res = await fetch("/api/uploads?all=true");
    const data = await res.json();
    setUploads(data.uploads || []);
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Go-My Space
        </h1>

        <p className="mt-2 text-gray-600">
          Track your submitted uploads and approval status.
        </p>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Your Uploads</h2>

          {uploads.length === 0 ? (
            <p className="text-gray-500">No uploads yet.</p>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {upload.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Creator: {upload.creator}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted:{" "}
                        {new Date(upload.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        upload.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {upload.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}