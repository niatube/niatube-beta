"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

export default function RevenuePartnershipPage() {
  const [creatorName, setCreatorName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [promoVideoUrl, setPromoVideoUrl] = useState("");
  const [category, setCategory] = useState("Merchandise");
  const [description, setDescription] = useState("");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [status, setStatus] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    async function loadCreator() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsSignedIn(false);
        setCheckingAuth(false);
        return;
      }

      setIsSignedIn(true);

      let activeCreatorName =
        user.user_metadata?.creator_name || user.email?.split("@")[0] || "";

      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("creator_name,email")
        .eq("email", user.email)
        .maybeSingle();

      if (profile?.creator_name) {
        activeCreatorName = profile.creator_name;
      }

      setCreatorName(activeCreatorName);
      setCheckingAuth(false);
    }

    loadCreator();
  }, []);

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();

    if (!isSignedIn) {
      setStatus("You must sign up and log in before applying.");
      return;
    }

    if (
      !creatorName.trim() ||
      !storeName.trim() ||
      !storeUrl.trim() ||
      !description.trim()
    ) {
      setStatus("Please complete all required fields.");
      return;
    }

    if (!storeUrl.trim().startsWith("https://")) {
      setStatus("Store Website URL must start with https://");
      return;
    }

    if (!promoVideoUrl.trim()) {
      setStatus("Promo Video URL is required.");
      return;
    }

    if (!promoVideoUrl.trim().startsWith("https://")) {
      setStatus("Promo Video URL must start with https://");
      return;
    }

    if (!promoVideoUrl.trim().toLowerCase().includes(".mp4")) {
      setStatus("Promo Video URL must point to an MP4 video.");
      return;
    }

    if (!agreementAccepted) {
      setStatus("Please accept the Revenue Partnership agreement.");
      return;
    }

    const { error } = await supabase.from("niamall_applications").insert([
      {
        creator_name: creatorName.trim(),
        store_name: storeName.trim(),
        store_url: storeUrl.trim(),
        promo_video_url: promoVideoUrl.trim(),
        category,
        description: description.trim(),
        agreement_accepted: agreementAccepted,
        status: "pending",
      },
    ]);

    if (error) {
      console.error(error);
      setStatus("Application failed. Please try again.");
      return;
    }

    await supabase.from("notifications").insert([
      {
        creator_name: creatorName.trim(),
        type: "niamall",
        title: "Revenue Partnership application submitted",
        message:
          "Your NiaMALL Revenue Partnership Program application has been submitted for review.",
      },
    ]);

    setStatus("Application submitted for review.");
    setStoreName("");
    setStoreUrl("");
    setPromoVideoUrl("");
    setCategory("Merchandise");
    setDescription("");
    setAgreementAccepted(false);
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <Navbar />
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            Checking creator access...
          </div>
        </section>
      </main>
    );
  }

 

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
            Revenue Partnership Program
          </p>

          <h1 className="mt-2 text-4xl font-black text-gray-900">
            Turn audience attention into creator commerce.
          </h1>

          <p className="mt-3 max-w-3xl text-gray-600">
            Apply to feature your creator store, products, services, or external
            storefront inside NiaMALL.
          </p>

          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-bold text-green-800">
              Signed in as: {creatorName}
            </p>
          </div>

          <form onSubmit={submitApplication} className="mt-8 space-y-5">
            <input
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
              placeholder="Creator name"
            />

            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
              placeholder="Store / Product Name"
            />

            <input
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
              placeholder="https://yourstore.com"
            />

            <input
              value={promoVideoUrl}
              onChange={(e) => setPromoVideoUrl(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
              placeholder="https://your-video.mp4"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option>Merchandise</option>
              <option>Fashion</option>
              <option>Books</option>
              <option>Courses</option>
              <option>Music</option>
              <option>Digital Products</option>
              <option>Art</option>
              <option>Food & Culture</option>
              <option>Events</option>
              <option>Services</option>
              <option>Other</option>
            </select>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[130px] w-full rounded-xl border px-4 py-3 text-sm"
              placeholder="Describe what you sell and why it fits NiaMALL."
            />

            <div className="rounded-2xl border bg-gray-50 p-5">
              <h3 className="text-lg font-black text-gray-900">
                Agreement Acknowledgement
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-700">
                I understand that submitting this application does not guarantee
                placement on NiaMALL. NiaTube may review, approve, reject, or
                remove listings to protect viewers, creators, and platform
                trust.
              </p>

              <label className="mt-4 flex items-start gap-3 text-sm font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                  className="mt-1"
                />
                I accept the Revenue Partnership Program review terms.
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
            >
              Submit Revenue Partnership Application
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