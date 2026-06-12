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
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <a
    href="/admin/migration-requests"
    className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
  >
    <h2 className="text-lg font-black">Subscriber Migration Requests</h2>
    <p className="mt-2 text-sm text-gray-600">
      Review and approve subscriber migration requests.
    </p>
  </a>

  <a
    href="/admin/niacircle"
    className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
  >
    <h2 className="text-lg font-black">NiaCircle Applications</h2>
    <p className="mt-2 text-sm text-gray-600">
      Review NiaCircle membership applications.
    </p>
  </a>

  <a
    href="/admin/niamall-application"
    className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
  >
    <h2 className="text-lg font-black">NiaMALL Applications</h2>
    <p className="mt-2 text-sm text-gray-600">
      Review NiaMALL partnership applications.
    </p>
  </a>

  <a
    href="/admin/finance"
    className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
  >
    <h2 className="text-lg font-black">Finance Dashboard</h2>
    <p className="mt-2 text-sm text-gray-600">
      Review platform finance reports.
    </p>
  </a>

  <a
    href="/admin/finance/payouts"
    className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
  >
    <h2 className="text-lg font-black">Payout Requests</h2>
    <p className="mt-2 text-sm text-gray-600">
      Review creator payout requests.
    </p>
  </a>

  <a
    href="/admin/fx"
    className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
  >
    <h2 className="text-lg font-black">FX Management</h2>
    <p className="mt-2 text-sm text-gray-600">
      Review and manage FX rates.
    </p>
  </a>
</div>
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