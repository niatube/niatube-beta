"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type InventorySlot = {
  id: string;
  slot_name: string;
  location: string;
  status?: string;
  assigned_campaign_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
};

export default function AdvertisingInventoryPage() {
  const [inventory, setInventory] = useState<InventorySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadInventory() {
    setLoading(true);

    const response = await fetch("/api/admin/advertising/inventory", {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Could not load advertising inventory.");
      setLoading(false);
      return;
    }

    setInventory((result.inventory || []) as InventorySlot[]);
    setLoading(false);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const totalSlots = inventory.length;

  const availableSlots = inventory.filter(
    (slot) => (slot.status || "available") === "available"
  ).length;

  const reservedSlots = inventory.filter(
    (slot) => slot.status === "reserved"
  ).length;

  const liveSlots = inventory.filter(
    (slot) => slot.status === "live"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Admin Advertising
        </p>

        <h1 className="mt-2 text-4xl font-black text-gray-900">
          Advertising Inventory
        </h1>

        <p className="mt-3 max-w-4xl text-gray-600">
          Manage NiaTube advertising slots, availability, reservations, and live campaign placements.
        </p>

        {message && (
          <p className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Slots</p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {totalSlots}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Available</p>
            <p className="mt-2 text-3xl font-black text-green-700">
              {availableSlots}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Reserved</p>
            <p className="mt-2 text-3xl font-black text-yellow-700">
              {reservedSlots}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Live Campaigns</p>
            <p className="mt-2 text-3xl font-black text-blue-700">
              {liveSlots}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading advertising inventory...
          </div>
        ) : inventory.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-gray-500 shadow-sm">
            No advertising inventory slots found.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="grid grid-cols-4 gap-4 border-b bg-gray-100 px-5 py-4 text-sm font-black text-gray-700">
              <p>Slot Name</p>
              <p>Location</p>
              <p>Status</p>
              <p>Campaign Assignment</p>
            </div>

            {inventory.map((slot) => (
              <div
                key={slot.id}
                className="grid grid-cols-4 gap-4 border-b px-5 py-4 text-sm last:border-b-0"
              >
                <p className="font-bold text-gray-900">{slot.slot_name}</p>

                <p className="text-gray-700">{slot.location}</p>

                <p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                      (slot.status || "available") === "available"
                        ? "bg-green-100 text-green-700"
                        : slot.status === "reserved"
                        ? "bg-yellow-100 text-yellow-700"
                        : slot.status === "live"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {slot.status || "available"}
                  </span>
                </p>

                <p className="text-gray-600">
                  {slot.assigned_campaign_id
                    ? `Campaign: ${slot.assigned_campaign_id}`
                    : "Not assigned"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}