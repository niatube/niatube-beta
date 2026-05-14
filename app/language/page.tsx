"use client";

import Navbar from "@/components/Navbar";

export default function LanguagePage() {
  const languages = [
    "English",
    "French",
    "Spanish",
    "Swahili",
    "Arabic",
    "Yoruba",
    "Zulu",
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f6] p-6">
      <Navbar />

      <h1 className="mb-6 mt-6 text-4xl font-extrabold">
        Select Language
      </h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {languages.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => {
              localStorage.setItem("niatube_language", lang);
              window.location.href = "/";
            }}
            className="cursor-pointer rounded-xl bg-white p-6 text-center font-semibold shadow hover:bg-yellow-100"
          >
            {lang}
          </button>
        ))}
      </div>
    </main>
  );
}