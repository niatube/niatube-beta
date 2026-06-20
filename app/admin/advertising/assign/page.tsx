"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Campaign = {
  id: string;
  company_name: string;
  campaign_message: string;
  ad_inventory?: string | null;
  estimated_budget?: string | null;
  preferred_start_date?: string | null;
  status?: string;
};

type InventorySlot = {
  id: string;
  slot_name: string;
  location: string;
  status?: string;
};

export default function AdvertisingAssignmentPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [inventory, setInventory] = useState<InventorySlot[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<Record<string, string>>({});
  const [startDates, setStartDates] = useState<Record<string, string>>({});
  const [endDates, setEndDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accessChecked, setAccessChecked] = useState(false);
const [hasAccess, setHasAccess] = useState(false);

  async function loadAssignmentData() {
    setLoading(true);

    const response = await fetch("/api/admin/advertising/assign", {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Could not load assignment data.");
      setLoading(false);
      return;
    }

    setCampaigns(result.campaigns || []);
    setInventory(result.inventory || []);
    setLoading(false);
  }

  useEffect(() => {
  async function checkAssignmentAccess() {
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
      await loadAssignmentData();
    } catch {
      setHasAccess(false);
      setAccessChecked(true);
      setLoading(false);
    }
  }

  checkAssignmentAccess();
}, []);

  async function assignCampaign(campaign: Campaign) {
    const inventoryId = selectedInventory[campaign.id];

    if (!inventoryId) {
      setMessage("Please select an inventory slot before assigning.");
      return;
    }

    const selectedSlot = inventory.find((slot) => slot.id === inventoryId);

    const response = await fetch("/api/admin/advertising/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        campaignId: campaign.id,
        inventoryId,
        advertiserName: campaign.company_name,
        campaignName: campaign.campaign_message?.slice(0, 80) || campaign.company_name,
        startDate: startDates[campaign.id] || campaign.preferred_start_date || null,
        endDate: endDates[campaign.id] || null,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Could not assign campaign.");
      return;
    }

    setMessage(
      `${campaign.company_name} assigned to ${selectedSlot?.slot_name || "selected slot"}.`
    );

    await loadAssignmentData();
  }

  const availableInventory = inventory.filter(
    (slot) => (slot.status || "available") === "available"
  );
  if (!accessChecked) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <p className="text-sm font-bold text-gray-600">
        Checking campaign assignment admin access...
      </p>
    </main>
  );
}

if (!hasAccess) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900">
          Campaign Assignment Access Required
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Please enter a valid Super Admin code before opening Campaign Assignment.
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
          Campaign Assignment
        </h1>

        <p className="mt-3 max-w-4xl text-gray-600">
          Assign approved advertiser campaigns to available NiaTube advertising inventory.
        </p>

        {message && (
          <p className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading campaign assignment data...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-gray-500 shadow-sm">
            No approved campaigns waiting for assignment.
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {campaign.company_name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                      Requested Placement:{" "}
                      <strong>{campaign.ad_inventory || "Not provided"}</strong>
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Budget:{" "}
                      <strong>{campaign.estimated_budget || "Not provided"}</strong>
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Preferred Start:{" "}
                      <strong>{campaign.preferred_start_date || "Not provided"}</strong>
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-black uppercase text-green-700">
                    {campaign.status || "approved"}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-black text-gray-700">
                    Campaign Description
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                    {campaign.campaign_message}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <select
                    value={selectedInventory[campaign.id] || ""}
                    onChange={(e) =>
                      setSelectedInventory((prev) => ({
                        ...prev,
                        [campaign.id]: e.target.value,
                      }))
                    }
                    className="rounded-xl border px-4 py-3"
                  >
                    <option value="">Select inventory slot</option>
                    {availableInventory.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.slot_name} — {slot.location}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={startDates[campaign.id] || ""}
                    onChange={(e) =>
                      setStartDates((prev) => ({
                        ...prev,
                        [campaign.id]: e.target.value,
                      }))
                    }
                    className="rounded-xl border px-4 py-3"
                  />

                  <input
                    type="date"
                    value={endDates[campaign.id] || ""}
                    onChange={(e) =>
                      setEndDates((prev) => ({
                        ...prev,
                        [campaign.id]: e.target.value,
                      }))
                    }
                    className="rounded-xl border px-4 py-3"
                  />

                  <button
                    onClick={() => assignCampaign(campaign)}
                    className="rounded-xl bg-black px-4 py-3 text-sm font-black text-white hover:bg-gray-800"
                  >
                    Reserve Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}