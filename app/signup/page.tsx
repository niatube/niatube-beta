"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

const countryCurrencyMap: Record<string, string> = {
  Algeria: "DZD",
  Angola: "AOA",
  Benin: "XOF",
  Botswana: "BWP",
  "Burkina Faso": "XOF",
  Burundi: "BIF",
  Cameroon: "XAF",
  "Cape Verde": "CVE",
  "Central African Republic": "XAF",
  Chad: "XAF",
  Comoros: "KMF",
  "Congo, Democratic Republic of the": "CDF",
  "Congo, Republic of the": "XAF",
  "Côte d'Ivoire": "XOF",
  Djibouti: "DJF",
  Egypt: "EGP",
  "Equatorial Guinea": "XAF",
  Eritrea: "ERN",
  Eswatini: "SZL",
  Ethiopia: "ETB",
  Gabon: "XAF",
  "Gambia, The": "GMD",
  Ghana: "GHS",
  Guinea: "GNF",
  "Guinea-Bissau": "XOF",
  Kenya: "KES",
  Lesotho: "LSL",
  Liberia: "LRD",
  Libya: "LYD",
  Madagascar: "MGA",
  Malawi: "MWK",
  Mali: "XOF",
  Mauritania: "MRU",
  Mauritius: "MUR",
  Morocco: "MAD",
  Mozambique: "MZN",
  Namibia: "NAD",
  Niger: "XOF",
  Nigeria: "NGN",
  Rwanda: "RWF",
  "São Tomé and Príncipe": "STN",
  Senegal: "XOF",
  Seychelles: "SCR",
  "Sierra Leone": "SLE",
  Somalia: "SOS",
  "South Africa": "ZAR",
  "South Sudan": "SSP",
  Sudan: "SDG",
  Tanzania: "TZS",
  Togo: "XOF",
  Tunisia: "TND",
  Uganda: "UGX",
  Zambia: "ZMW",
  Zimbabwe: "ZWL",
  Europe: "EUR",
  "United States": "USD",
};

const countries = Object.keys(countryCurrencyMap);

export default function SignupPage() {
  const [creatorName, setCreatorName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Culture");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const currencyCode = countryCurrencyMap[country];

    if (!creatorName.trim() || !country.trim() || !currencyCode || !email.trim() || !password.trim()) {
      setMessage("Please complete all required fields.");
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
  setMessage(
    "You must read and accept the Terms of Service, Privacy Policy, and Creator Monetization & Payout Terms before creating an account."
  );
  setLoading(false);
  return;
}

    const { error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login/creator`,
        data: {
  creator_name: creatorName.trim(),
  creator_country: country,
  currency_code: currencyCode,
  creator_interest: interest,
  accepted_terms: true,
  accepted_terms_at: new Date().toISOString(),
  accepted_creator_monetization_terms: true,
},
      },
    });

    if (signupError) {
      setMessage(`Signup error: ${signupError.message}`);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
  .from("creator_profiles")
  .upsert(
    [
      {
        creator_name: creatorName.trim(),
        email: email.trim(),
        country,
        currency_code: currencyCode,
        migrated_subscribers: 0,
        verified: false,
        accepted_terms: true,
        accepted_terms_at: new Date().toISOString(),
        accepted_creator_monetization_terms: true,
      },
    ],
    { onConflict: "creator_name" }
  );

    setLoading(false);

    if (profileError) {
      setMessage(`Profile save error: ${profileError.message}`);
      return;
    }

    setCreatorName("");
    setCountry("");
    setEmail("");
    setPassword("");
    setInterest("Culture");

    setMessage(
      "Congratulations. Your account was created. Please check your email to confirm your account, then return here to log in."
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <Navbar />

      <section className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-yellow-600">
            Creator Sign Up
          </p>

          <h1 className="text-3xl font-black text-gray-900">
            Create your NiaTube creator account
          </h1>

          <p className="mt-3 text-gray-600">
            Sign up first before logging in to NiaTube.
          </p>

          <form onSubmit={handleSignup} className="mt-8 space-y-4">
            <input
              required
              placeholder="Creator name"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />

            <select
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option value="">Select creator country/region</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item} — {countryCurrencyMap[item]}
                </option>
              ))}
            </select>

            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />

            <select
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option>Culture</option>
              <option>News</option>
              <option>Afrobeats</option>
              <option>Podcast</option>
              <option>Education</option>
              <option>Business</option>
              <option>Sports</option>
              <option>Film</option>
              <option>Travel</option>
            </select>

            <input
              type="password"
              required
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />

            <label className="flex gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-700">
  <input
    type="checkbox"
    checked={acceptedTerms}
    onChange={(e) => setAcceptedTerms(e.target.checked)}
    className="mt-1"
  />

  <span>
    I have read and agree to NiaTube&apos;s{" "}
    <Link href="/terms" className="font-bold text-yellow-700 hover:underline">
      Terms of Service
    </Link>
    ,{" "}
    <Link href="/privacy" className="font-bold text-yellow-700 hover:underline">
      Privacy Policy
    </Link>
    , and Creator Monetization &amp; Payout Terms, including that creator payouts are made in the creator&apos;s registered local payout currency and may involve FX conversion at payout.
  </span>
</label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 px-6 py-3 text-sm font-black text-black hover:bg-yellow-300 disabled:bg-gray-300"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-10 border-t pt-8">
            <p className="text-center text-sm font-bold uppercase tracking-wide text-yellow-700">
              Already have an audience?
            </p>

            <h2 className="mt-3 text-center text-2xl font-black text-gray-900">
              Keep your monetization momentum.
              <br />
              Bring your audience to NiaTube.
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-6 text-gray-700">
              Verified creators can request subscriber migration from platforms
              like YouTube, TikTok, Instagram, Twitch, and more.
            </p>

            <div className="mx-auto mt-5 max-w-lg rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
              <p className="text-center text-sm font-bold text-gray-800">
                Make sure you signed up first and confirmed your email before
                starting subscribers migration.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/creator/migrate"
                className="inline-block rounded-xl bg-black px-6 py-3 text-sm font-black text-white hover:bg-gray-800"
              >
                Start Subscribers Migration
              </Link>
            </div>
          </div>

          {message && (
            <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-800">
              {message}
            </p>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login/creator"
              className="text-sm font-bold text-yellow-700 hover:underline"
            >
              Already signed up? Go back to Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}