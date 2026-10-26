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

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  setLoading(false);

  if (error) {
    console.error("Creator login error:", error);
    setMessage(`Login failed: ${error.message}`);
    return;
  }

  if (!data.session) {
    setMessage("Login succeeded, but no active session was created.");
    return;
  }

      window.location.href = "/my-space";
}

async function handleForgotPassword() {
  if (!email.trim()) {
    setMessage("Please enter your email address first.");
    return;
  }

  setLoading(true);
  setMessage("");

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: `${window.location.origin}/creator/reset-password`,
    }
  );

  setLoading(false);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage(
    "If an account exists for this email address, you will receive a password reset link. Please check your inbox."
  );
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
  autoComplete="email"
  required
  placeholder="Email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full rounded-xl border px-4 py-3 text-sm"
/>

            <input
  type="password"
  autoComplete="current-password"
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

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full text-center text-sm font-semibold text-blue-600 underline hover:text-blue-800 disabled:opacity-50"
            >
              Forgot Password?
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