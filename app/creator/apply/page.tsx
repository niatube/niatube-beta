"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function CreatorApplyPage() {
  const [creatorName, setCreatorName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!creatorName.trim()) {
      setMessage("Creator name is required.");
      return;
    }

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (!password.trim()) {
      setMessage("Password is required.");
      return;
    }

    if (!agree) {
      setMessage("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          creator_name: creatorName.trim(),
          accepted_terms: true,
          accepted_terms_at: new Date().toISOString(),
        },
        emailRedirectTo: "http://localhost:3000/creator/apply",
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Account created. Please check your email and confirm your account. After confirming, return here and log in."
      );
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (!password.trim()) {
      setMessage("Password is required.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push("/creator-dashboard");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow">
        <h1 className="mb-2 text-xl font-bold">Creator Login</h1>

        <p className="mb-5 text-sm text-gray-600">
          Sign up first, confirm your email if required, then return here to log
          in.
        </p>

        <input
          type="text"
          placeholder="Creator name"
          className="mb-3 w-full rounded border px-3 py-2"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-3 w-full rounded border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="mb-4 flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1"
          />

          <span>
  I have read and agree to the{" "}
  <a
    href="/terms"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 underline"
  >
    Terms of Service
  </a>{" "}
  and{" "}
  <a
    href="/privacy"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 underline"
  >
    Privacy Policy
  </a>
  .
</span>
        </label>

        <div className="flex gap-2">
          <button
            onClick={handleLogin}
            className="flex-1 rounded bg-black py-2 font-semibold text-white"
          >
            Login
          </button>

          <button
            onClick={handleSignup}
            className="flex-1 rounded bg-yellow-400 py-2 font-semibold text-black"
          >
            Sign Up
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded bg-yellow-50 p-3 text-sm font-medium text-gray-800">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}