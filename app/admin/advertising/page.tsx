"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type AdRequest = {
  id: string;
  company_name: string;
  contact_person?: string | null;
  email: string;
  phone_number?: string | null;
  country?: string | null;
  website?: string | null;
  campaign_message: string;
 estimated_budget?: string | null;
ad_inventory?: string | null;
preferred_start_date?: string | null;
  status?: string;
  created_at?: string;
};

export default function AdminAdvertisingPage() {
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const pendingLeads = requests.filter(
  (request) => request.status === "pending"
).length;

const contactedLeads = requests.filter(
  (request) => request.status === "contacted"
).length;

const approvedCampaigns = requests.filter(
  (request) => request.status === "approved"
).length;

const liveCampaigns = requests.filter(
  (request) => request.status === "campaign_live"
).length;

 async function loadRequests() {
  setLoading(true);

  const response = await fetch("/api/admin/advertising", {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    setMessage(result.error || "Could not load advertising requests.");
    setLoading(false);
    return;
  }

  setRequests((result.requests || []) as AdRequest[]);
  setLoading(false);
}

   

  useEffect(() => {
    async function checkAdvertisingAccess() {
      const rawAccess = sessionStorage.getItem("niatube_admin_access");

      if (!rawAccess) {
        setHasAccess(false);
        setAccessChecked(true);
        setLoading(false);
        return;
      }

      try {
        const access = JSON.parse(rawAccess);

        const response = await fetch("/api/admin/session/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionToken: access.sessionToken,
            requestedPath: "/admin/advertising",
          }),
        });

        const result = await response.json();

        if (!result.allowed) {
          setHasAccess(false);
          setAccessChecked(true);
          setLoading(false);
          return;
        }

        setHasAccess(true);
        setAccessChecked(true);
        await loadRequests();
      } catch {
        setHasAccess(false);
        setAccessChecked(true);
        setLoading(false);
      }
    }

    checkAdvertisingAccess();
  }, []);

 async function updateStatus(id: string, status: string) {
  const { error } = await supabase
    .from("ad_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    setMessage("Could not update advertising request status.");
    return;
  }

  setRequests((prev) =>
    prev.map((request) =>
      request.id === id
        ? { ...request, status }
        : request
    )
  );

  setMessage("Advertising request status updated.");
}

  if (!accessChecked) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <p className="text-sm font-bold text-gray-600">
          Checking advertising admin access...
        </p>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-gray-900">
            Advertising Admin Access Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Please enter a valid Super Admin code before opening Advertising Requests.
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
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Admin Advertising
        </p>

        <h1 className="mt-2 text-4xl font-black text-gray-900">
          Advertising Requests
        </h1>

        <p className="mt-3 max-w-4xl text-gray-600">
          Review advertiser leads submitted through the Advertise on NiaTube form.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-gray-500">Pending Leads</p>
    <p className="mt-2 text-3xl font-black text-gray-900">
      {pendingLeads}
    </p>
  </div>

  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-gray-500">Contacted Leads</p>
    <p className="mt-2 text-3xl font-black text-gray-900">
      {contactedLeads}
    </p>
  </div>

  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-gray-500">Approved Campaigns</p>
    <p className="mt-2 text-3xl font-black text-gray-900">
      {approvedCampaigns}
    </p>
  </div>

  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-gray-500">Live Campaigns</p>
    <p className="mt-2 text-3xl font-black text-gray-900">
      {liveCampaigns}
    </p>
  </div>
</div>

        {message && (
          <p className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading advertising requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm text-gray-500">
            No advertising requests yet.
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {request.company_name}
                    </h2>

                    <p className="mt-1 text-sm font-bold text-gray-600">
                      Contact: {request.contact_person || "Not provided"}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Submitted:{" "}
                      {request.created_at
                        ? new Date(request.created_at).toLocaleString()
                        : "Not available"}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-4 py-2 text-xs font-black uppercase">
                    {request.status || "pending"}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <p>
                    <strong>Email:</strong> {request.email}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {request.phone_number || "Not provided"}
                  </p>
                  <p>
                    <strong>Country:</strong>{" "}
                    {request.country || "Not provided"}
                  </p>
                  <p>
                    <strong>Website:</strong>{" "}
                    {request.website ? (
                      <a
                        href={request.website}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        Open Website
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                  
                  <p>
                    <strong>Budget:</strong>{" "}
                    {request.estimated_budget || "Not provided"}
                  </p>
                 <p>
  <strong>Ad Placement:</strong>{" "}
  {request.ad_inventory || "Not provided"}
</p>
                 
                  <p>
                    <strong>Preferred Start:</strong>{" "}
                    {request.preferred_start_date || "Not provided"}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-black text-gray-700">
                    Campaign Description
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                    {request.campaign_message}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    "pending",
                    "contacted",
                    "approved",
                    "declined",
                    "campaign_live",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(request.id, status)}
                      className="rounded-xl border px-4 py-2 text-xs font-bold hover:bg-gray-50"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}