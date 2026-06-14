"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";

export default function AdvertisePage() {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [preferredStartDate, setPreferredStartDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (
      !companyName.trim() ||
      !contactPerson.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !country.trim() ||
      !campaignMessage.trim()
    ) {
      setMessage("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("ad_requests").insert([
      {
        company_name: companyName.trim(),
        contact_person: contactPerson.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        country: country.trim(),
        website: website.trim() || null,
        campaign_message: campaignMessage.trim(),
        estimated_budget: estimatedBudget.trim() || null,
        preferred_start_date: preferredStartDate || null,
      },
    ]);

    setSubmitting(false);

    if (error) {
      setMessage("Could not submit advertising request.");
      return;
    }

    setCompanyName("");
    setContactPerson("");
    setEmail("");
    setPhoneNumber("");
    setCountry("");
    setWebsite("");
    setCampaignMessage("");
    setEstimatedBudget("");
    setPreferredStartDate("");

    setMessage(
      "Your advertising request has been received. A NiaTube representative will contact you."
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f6] p-6">
      <h1 className="mb-6 text-4xl font-extrabold">
        Advertise on NiaTube
      </h1>

      <div className="max-w-3xl rounded-xl bg-white p-6 shadow">
        <p className="text-lg">
          Reach Pan-African audiences across news, culture, entertainment, live
          events, and creator communities.
        </p>

        <p className="mt-4 text-gray-600">
          Complete the form below and NiaTube will review your campaign request.
        </p>

        {message && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm font-medium text-yellow-800">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input type="text" placeholder="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-md border px-4 py-2" />
          <input type="text" placeholder="Contact Person *" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full rounded-md border px-4 py-2" />
          <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border px-4 py-2" />
          <input type="tel" placeholder="Phone Number *" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full rounded-md border px-4 py-2" />
          <input type="text" placeholder="Country *" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-md border px-4 py-2" />
          <input type="url" placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full rounded-md border px-4 py-2" />
          <input type="text" placeholder="Estimated Budget" value={estimatedBudget} onChange={(e) => setEstimatedBudget(e.target.value)} className="w-full rounded-md border px-4 py-2" />

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Preferred Start Date
            </label>
            <input type="date" value={preferredStartDate} onChange={(e) => setPreferredStartDate(e.target.value)} className="w-full rounded-md border px-4 py-2" />
          </div>

          <textarea placeholder="Campaign Description *" value={campaignMessage} onChange={(e) => setCampaignMessage(e.target.value)} className="w-full rounded-md border px-4 py-2" rows={6} />

          <button type="submit" disabled={submitting} className="rounded-md bg-yellow-400 px-6 py-2 font-semibold disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit Advertising Request"}
          </button>
        </form>
      </div>
    </main>
  );
}