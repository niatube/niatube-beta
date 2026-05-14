"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

export default function NiaCircleApplyPage() {
  const [creatorName, setCreatorName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Culture");
  const [bio, setBio] = useState("");
  const [reason, setReason] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const { error } = await supabase
    .from("niacircle_members")
    .insert([
      {
        creator_name: creatorName,
        email,
        category,
        bio,
        reason,
        social_link: socialLink,
        status: "pending",
      },
    ]);

  if (error) {
    console.error("NiaCircle application error:", error);
    return;
  }

  setSubmitted(true);
}

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-yellow-600">
            NiaCircle Membership
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Apply to Join NiaCircle
          </h1>

          <p className="mt-3 text-gray-600">
            Complete this short form to request access to NiaTube’s confirmed
            creator community ecosystem.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
              <h2 className="text-xl font-black text-green-900">
                Application submitted
              </h2>
              <p className="mt-2 text-green-800">
               Your NiaCircle membership request is under review.
               You will receive an email once our review is completed.
             </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700">
                  Creator Name
                </label>
                
                
                <input
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border px-4 py-3"
                  placeholder="Your creator or channel name"
                />
              </div>
              <div>
  <label className="text-sm font-bold text-gray-700">
    Email Address
  </label>

  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="mt-2 w-full rounded-xl border px-4 py-3"
    placeholder="you@example.com"
  />
</div>

              <div>
                <label className="text-sm font-bold text-gray-700">
                  Creator Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3"
                >
                  <option>Music</option>
                  <option>Culture</option>
                  <option>History</option>
                  <option>Education</option>
                  <option>Business</option>
                  <option>Commentary</option>
                  <option>News</option>
                  <option>Sports</option>
                  <option>Technology</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">
                  Short Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                  className="mt-2 min-h-[100px] w-full rounded-xl border px-4 py-3"
                  placeholder="Briefly describe who you are and what you create."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">
                  Why do you want to join NiaCircle?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="mt-2 min-h-[120px] w-full rounded-xl border px-4 py-3"
                  placeholder="Tell us how you hope to participate in the NiaCircle community."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">
                  Social or Website Link Optional
                </label>
                <input
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3"
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-yellow-500 px-6 py-4 font-black text-black hover:bg-yellow-400"
              >
                Submit NiaCircle Application
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

