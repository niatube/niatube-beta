"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

export default function SignupPage() {
  const [creatorName, setCreatorName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Culture");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!creatorName.trim() || !email.trim() || !password.trim()) {
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
  },
]);

    setLoading(false);

    if (profileError) {
      setMessage(`Profile save error: ${profileError.message}`);
      return;
    }

    setCreatorName("");
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
              <option>Music</option>
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