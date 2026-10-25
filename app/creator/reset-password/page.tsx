"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

export default function CreatorResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;

    const recoveryHash = new URLSearchParams(
      window.location.hash.substring(1)
    );

    const hasRecoveryFragment =
      recoveryHash.get("type") === "recovery" &&
      Boolean(recoveryHash.get("access_token"));

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (!active) return;

        if (event === "PASSWORD_RECOVERY") {
          setMessage("");
          setRecoveryReady(true);
        }
      }
    );

    async function checkRecoverySession() {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      const code = params.get("code");

      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (!active) return;

        if (error) {
          setMessage(
            "This recovery link is invalid or expired. Please request a new one."
          );
          return;
        }

        window.history.replaceState({}, "", window.location.pathname);
        setMessage("");
        setRecoveryReady(true);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!active) return;

        if (error) {
          setMessage(
            "This recovery link is invalid or expired. Please request a new one."
          );
          return;
        }

        window.history.replaceState({}, "", window.location.pathname);
        setMessage("");
        setRecoveryReady(true);
        return;
      }

      if (hasRecoveryFragment) {
        const { data, error } = await supabase.auth.getSession();

        if (!active) return;

        if (error || !data.session) {
          setMessage(
            "This recovery link is invalid or expired. Please request a new one."
          );
          return;
        }

        setMessage("");
        setRecoveryReady(true);
        return;
      }

      setMessage(
        "Open this page using the password recovery link sent to your email."
      );
    }

    void checkRecoverySession();

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!recoveryReady || saving) return;

    if (password.length < 8) {
      setMessage("Your new password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCompleted(true);
    setMessage("Your password has been updated successfully.");
    await supabase.auth.signOut();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow">
        <h1 className="mb-3 text-xl font-bold text-gray-900">
          Reset Creator Password
        </h1>

        {recoveryReady && !completed && (
          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="New password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mb-3 w-full rounded border px-3 py-2 text-gray-900"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="mb-4 w-full rounded border px-3 py-2 text-gray-900"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded bg-black py-2 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {message && (
          <p role="status" className="mt-4 rounded bg-yellow-50 p-3 text-sm text-gray-800">
            {message}
          </p>
        )}

        <Link
          href="/creator/apply"
          className="mt-5 block text-center text-sm font-medium text-blue-600 underline"
        >
          Return to Creator Login
        </Link>
      </div>
    </main>
  );
}