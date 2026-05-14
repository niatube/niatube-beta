"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

export default function CreatorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(
        "Login failed. Please make sure you signed up first and confirmed your email."
      );
      return;
    }

    window.location.href = "/my-space";
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-black uppercase text-yellow-600">
            Creator Login
          </p>

          <h1 className="text-3xl font-black text-gray-900">
            Log in to NiaTube
          </h1>

          <p className="mt-3 text-gray-600">
            Only creators who have already signed up can log in.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />

            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-6 py-3 text-sm font-black text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {message && (
            <p className="mt-5 rounded-xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}