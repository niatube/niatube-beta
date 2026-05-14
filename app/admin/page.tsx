"use client";

import { useEffect, useState } from "react";

type Upload = {
  id: string;
  title: string;
  creator: string;
  status: string;
};

export default function AdminPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);

  const fetchUploads = async () => {
    const res = await fetch("/api/uploads?all=true");
    const data = await res.json();
    setUploads(data.uploads || []);
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const publish = async (id: string) => {
    await fetch("/api/uploads/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    fetchUploads();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin: Pending Uploads</h1>
      <p className="mb-4 text-red-600 font-bold">
  ADMIN PAGE TEST
</p>
<p className="mb-4 text-blue-600">
  Uploads found: {uploads.length}
</p>
      <p className="mb-4 text-sm text-gray-600">
  Uploads found: {uploads.length}
</p>

      {uploads.map((u) => (
        <div key={u.id} className="mb-4 border p-4 rounded">
          <p><strong>{u.title}</strong></p>
          <p>{u.creator}</p>
          <p>Status: {u.status}</p>

          {u.status === "pending" && (
            <button
              onClick={() => publish(u.id)}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              Publish
            </button>
          )}
        </div>
      ))}
    </div>
  );
}