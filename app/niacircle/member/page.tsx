"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

export default function NiaCircleMemberPage() {
  const [creatorName, setCreatorName] = useState("");
  const [status, setStatus] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);

  function goToCommunity() {
    window.location.href = "/niacircle/community";
  }

  async function checkMembershipStatus() {
    const name = creatorName.trim();

    if (!name) {
      setStatus("missing_name");
      return;
    }

    setCheckingStatus(true);

    const { data, error } = await supabase
      .from("niacircle_members")
      .select("status")
      .ilike("creator_name", name)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setCheckingStatus(false);

    if (error || !data) {
      setStatus("not_found");
      return;
    }

    setStatus(data.status);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="mb-3 text-sm font-bold uppercase text-yellow-600">
            Verify NiaCircle Membership
          </p>

          <h1 className="text-4xl font-black text-gray-900">
            Welcome to Your NiaCircle Space
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-gray-700">
            Enter your creator name to check your NiaCircle approval status.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <input
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
              placeholder="Enter your creator name"
            />

            <button
              onClick={checkMembershipStatus}
              disabled={checkingStatus}
              className="mt-4 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {checkingStatus ? "Checking..." : "Check Approval Status"}
            </button>

            {status === "approved" && (
              <div className="mt-6 rounded-xl bg-green-50 p-5">
                <p className="font-bold text-green-800">
                  Approved — welcome to NiaCircle.
                </p>

                <button
                  onClick={goToCommunity}
                  className="mt-4 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white hover:bg-gray-800"
                >
                  Enter NiaCircle Space
                </button>
              </div>
            )}

            {status === "pending" && (
              <p className="mt-5 rounded-xl bg-yellow-50 p-4 font-semibold text-yellow-800">
                Your NiaCircle application is still pending.
              </p>
            )}

            {status === "rejected" && (
              <p className="mt-5 rounded-xl bg-red-50 p-4 font-semibold text-red-700">
                Your NiaCircle application was not approved.
              </p>
            )}

           {status === "not_found" && (
  <div className="mt-5 rounded-xl bg-gray-100 p-4">
    <p className="font-semibold text-gray-700">
      No NiaCircle application was found for that creator name.
    </p>

    <a
      href="/niacircle/apply"
      className="mt-3 inline-block rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold text-black hover:bg-yellow-300"
    >
      Go back and apply to NiaCircle
    </a>
  </div>
)}

            {status === "missing_name" && (
              <p className="mt-5 rounded-xl bg-gray-100 p-4 font-semibold text-gray-700">
                Please enter your creator name.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}