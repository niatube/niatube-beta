"use client";

import { useEffect, useState } from "react";
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

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();

    if (
      !creatorName.trim() ||
      !storeName.trim() ||
      !storeUrl.trim() ||
      !description.trim()
    ) {
      setStatus("Please complete all required fields.");
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
            Apply to feature your creator store, products, services, or
            external storefront inside NiaMALL.
          </p>

          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <h2 className="text-lg font-black text-gray-900">
              Video-Commerce Advantage
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              Approved creators can showcase their products using short promo
              videos. This allows viewers to discover products visually before
              visiting the creator’s external store website.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-black text-gray-900">
              Partnership Requirement
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              NiaMALL is curated. Creators must apply and be approved before any
              store or product appears publicly. This protects viewers,
              strengthens creator trust, and keeps commerce opportunities
              high-quality.
            </p>
          </div>

          <form onSubmit={submitApplication} className="mt-8 space-y-5">
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
                Store / Product Name
              </label>

              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="Example: Zuri Apparel"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Store Website URL
              </label>

              <input
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="https://yourstore.com"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Promo Video URL
              </label>

              <input
                value={promoVideoUrl}
                onChange={(e) => setPromoVideoUrl(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="https://..."
              />

              <p className="mt-2 text-xs text-gray-500">
                Add a short promo/store/product video link. This video may later
                appear inside NiaMALL storefront listings.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
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
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Store / Product Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 min-h-[130px] w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="Describe what you sell and why it fits NiaMALL."
              />
            </div>

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