"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

export default function CreatorMigrationPage() {
  const [creatorName, setCreatorName] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [channelUrl, setChannelUrl] = useState("");
  const [claimedSubscribers, setClaimedSubscribers] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadCreator() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      let activeCreatorName =
        user.user_metadata?.creator_name ||
        user.email?.split("@")[0] ||
        "";

      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("creator_name,email")
        .eq("email", user.email)
        .maybeSingle();

      if (profile?.creator_name) {
        activeCreatorName = profile.creator_name;
      }

      setCreatorName(activeCreatorName);
    }

    loadCreator();
  }, []);

  async function submitMigrationRequest(e: React.FormEvent) {
    e.preventDefault();

    if (!creatorName.trim()) {
      setStatus("Please log in as a creator before submitting.");
      return;
    }

    if (!platform.trim() || !channelUrl.trim() || !claimedSubscribers.trim()) {
      setStatus("Platform, channel URL, and subscriber count are required.");
      return;
    }

    const subscriberNumber = Number(claimedSubscribers);

    if (!subscriberNumber || subscriberNumber <= 0) {
      setStatus("Please enter a valid subscriber count.");
      return;
    }

    const { error } = await supabase.from("creator_migration_requests").insert([
      {
        creator_name: creatorName.trim(),
        platform,
        channel_url: channelUrl.trim(),
        claimed_subscribers: subscriberNumber,
        proof_url: proofUrl.trim(),
        review_notes: notes.trim(),
        status: "pending",
      },
    ]);

    if (error) {
      console.error(error);
      setStatus("Migration request failed. Please check Supabase policies.");
      return;
    }

    await supabase.from("notifications").insert([
      {
        creator_name: creatorName.trim(),
        type: "migration",
        title: "Migration request submitted",
        message: `Your ${platform} subscriber migration request has been submitted for review.`,
      },
    ]);

    setStatus("Subscriber migration request submitted for review. If this is an update, the review team will compare it with your previous approved migration.");
    setChannelUrl("");
    setClaimedSubscribers("");
    setProofUrl("");
    setNotes("");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
  Subscriber Migration
</p>

          <h1 className="mt-2 text-4xl font-black text-gray-900">
  Keep your monetization momentum.
  <br />
  Bring your audience to NiaTube.
</h1>

        <p className="mt-3 text-gray-600">
  Request verification of your existing subscribers or followers so
  your NiaTube profile reflects the audience you have already built.
</p>

          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <h2 className="text-lg font-black text-gray-900">
              Why this matters
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              NiaTube is designed so creators do not have to appear as if they
              are starting from zero. Verified migration helps preserve social
              proof while NiaTube tracks native subscribers separately.
            </p>
          </div>

          <form onSubmit={submitMigrationRequest} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700">
                Creator Name
              </label>

              <input
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="Creator name"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Platform
              </label>

              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
              >
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Twitch">Twitch</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Channel / Profile URL
              </label>

              <input
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Claimed Subscriber / Follower Count
              </label>

              <input
                value={claimedSubscribers}
                onChange={(e) => setClaimedSubscribers(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="Example: 25000"
                type="number"
                min="1"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Proof URL
              </label>

              <input
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="Link to screenshot, public analytics, or proof document"
              />

              <p className="mt-2 text-xs text-gray-500">
                For now, paste a link to proof. Later we can add direct file
                upload.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Notes for Review Team
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 min-h-[120px] w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="Add any context that helps verify your audience."
              />
            </div>

            <button
  type="submit"
  className="w-full rounded-xl bg-black px-5 py-3 text-sm font-bold text-white hover:bg-gray-800"
>
  Submit / Update Subscriber Migration Request
</button>

            {status && (
              <p className="rounded-xl bg-gray-100 p-4 text-sm font-bold text-gray-700">
                {status}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}