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
  const [accessChecked, setAccessChecked] = useState(false);
const [hasAccess, setHasAccess] = useState(false);

  const fetchUploads = async () => {
    const res = await fetch("/api/uploads?all=true");
    const data = await res.json();
    setUploads(data.uploads || []);
  };

 useEffect(() => {
  const rawAccess = sessionStorage.getItem("niatube_admin_access");

  if (!rawAccess) {
    setHasAccess(false);
    setAccessChecked(true);
    return;
  }

  try {
    const access = JSON.parse(rawAccess);
    const expiresAt = access?.expiresAt ? new Date(access.expiresAt) : null;
    const allowedPath = access?.redirectPath;

    if (!access?.sessionToken || !expiresAt || expiresAt < new Date()) {
      sessionStorage.removeItem("niatube_admin_access");
      setHasAccess(false);
      setAccessChecked(true);
      return;
    }

    if (allowedPath !== "/admin") {
      setHasAccess(false);
      setAccessChecked(true);
      return;
    }

    setHasAccess(true);
    setAccessChecked(true);
    fetchUploads();
  } catch {
    sessionStorage.removeItem("niatube_admin_access");
    setHasAccess(false);
    setAccessChecked(true);
  }
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
  if (!accessChecked) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <p className="text-sm font-bold text-gray-600">
        Checking admin access...
      </p>
    </main>
  );
}

if (!hasAccess) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900">
          Admin Access Required
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Please enter the Super Admin code to open the Admin Control Center.
        </p>

        <a
          href="/admin/access"
          className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
        >
          Enter Admin Code
        </a>
      </section>
    </main>
  );
}

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Control Center</h1>
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <a
    href="/admin/migration-requests"
    className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
  >
    <h2 className="text-lg font-black">Subscriber Migration Requests</h2>
    
    <p className="mt-3 text-gray-600">
  Review submissions, applications, advertising requests, and platform operations.
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
    href="/admin/niamall-applications"
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

  <a
  href="/admin/advertising"
  className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
>
  <h2 className="text-lg font-black">Advertising Requests</h2>
  <p className="mt-2 text-sm text-gray-600">
    Review advertiser campaign requests and update sales status.
  </p>
</a>
<a
  href="/admin/advertising/inventory"
  className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
>
  <h2 className="text-lg font-black">Advertising Inventory</h2>

  <p className="mt-2 text-sm text-gray-600">
    Manage ad inventory, slot availability, reserved campaigns, and live placements.
  </p>
</a>

<a
  href="/admin/advertising/assign"
  className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
>
  <h2 className="text-lg font-black">Campaign Assignment</h2>

  <p className="mt-2 text-sm text-gray-600">
    Assign approved advertising campaigns to available inventory slots.
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