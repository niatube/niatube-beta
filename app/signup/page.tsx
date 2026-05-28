"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

const countries = [
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Chad",
  "Congo, Democratic Republic of the",
  "Congo, Republic of the",
  "Côte d'Ivoire",
  "Egypt",
  "Ethiopia",
  "France",
  "Gambia, The",
  "Ghana",
  "Kenya",
  "Liberia",
  "Mali",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "Senegal",
  "Sierra Leone",
  "South Africa",
  "Tanzania",
  "Togo",
  "Uganda",
  "United Kingdom",
  "United States",
  "Zambia",
  "Zimbabwe",
  "Other",
];

export default function SignupPage() {
  const [creatorName, setCreatorName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Culture");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!creatorName.trim() || !country.trim() || !email.trim() || !password.trim()) {
      setMessage("Please complete all required fields.");
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
          creator_interest: interest,
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
      .insert([
        {
          creator_name: creatorName.trim(),
          email: email.trim(),
          country,
        },
      ]);

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
              <option value="">Select creator country</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
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