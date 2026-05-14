"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";

export default function CreatorEditPage() {
  const [creatorName, setCreatorName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  async function uploadFile(file: File, bucket: "avatars" | "banners") {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `profiles/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setMessage("");

      const url = await uploadFile(file, "avatars");
      setAvatarUrl(url);
      setMessage("Avatar uploaded. Now click Save Profile.");
    } catch (error: any) {
      setMessage(error.message || "Avatar upload failed.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      setMessage("");

      const url = await uploadFile(file, "banners");
      setBannerUrl(url);
      setMessage("Banner uploaded. Now click Save Profile.");
    } catch (error: any) {
      setMessage(error.message || "Banner upload failed.");
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!creatorName.trim()) {
      setMessage("Creator name is required.");
      return;
    }

    const { error } = await supabase.from("creator_profiles").upsert(
      {
        creator_name: creatorName.trim(),
        bio,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        verified,
      },
      {
        onConflict: "creator_name",
      }
    );

    if (error) {
      console.error("Creator profile save error:", error);
      setMessage(error.message);
    } else {
      setMessage("Profile saved successfully.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Edit Creator Profile</h1>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <input
            placeholder="Creator Name (exact match)"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            className="w-full rounded border p-3"
          />

          <textarea
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded border p-3"
            rows={4}
          />

          <div className="rounded-xl border p-4">
            <label className="block font-bold">Avatar Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="mt-2 w-full rounded border p-3"
            />
            {uploadingAvatar && (
              <p className="mt-2 text-sm text-gray-600">Uploading avatar...</p>
            )}
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="mt-3 h-20 w-20 rounded-full object-cover"
              />
            )}
          </div>

          <div className="rounded-xl border p-4">
            <label className="block font-bold">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="mt-2 w-full rounded border p-3"
            />
            {uploadingBanner && (
              <p className="mt-2 text-sm text-gray-600">Uploading banner...</p>
            )}
            {bannerUrl && (
              <img
                src={bannerUrl}
                alt="Banner preview"
                className="mt-3 h-28 w-full rounded object-cover"
              />
            )}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
            />
            Verified
          </label>

          <button className="w-full rounded bg-black p-3 font-bold text-white">
            Save Profile
          </button>
        </form>

        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
}