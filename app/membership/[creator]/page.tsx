"use client";

import { useState } from "react";
import { getPricingProfileForCountry } from "@/lib/pan-african-monetization-config";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

export default function MembershipPage() {
  const params = useParams();
  const creator = decodeURIComponent(params?.creator as string);

  const [joining, setJoining] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

 const [viewerCountry, setViewerCountry] = useState("ML");

const membershipPricingProfile =
  getPricingProfileForCountry(viewerCountry);

const membershipCurrency =
  membershipPricingProfile?.currencyCode || "USD";

const membershipAmount =
  membershipPricingProfile?.membershipPrice || 5;

  async function joinMembership() {
    setJoining(true);
    setStatusMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      setStatusMessage("Please sign in before joining a membership.");
      setJoining(false);
      return;
    }

    const response = await fetch("/api/membership/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creator_name: creator,
        viewer_id: user.id,
        viewer_name: user.email || "Member",
        tier: "Supporter",
        amount: membershipAmount,
        currency_code: membershipCurrency,
         country: viewerCountry,
        payment_method: "CARD",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setStatusMessage(result?.error || "Membership signup failed.");
      setJoining(false);
      return;
    }

    setStatusMessage("Membership started successfully.");
    setJoining(false);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="bg-gradient-to-r from-purple-700 to-purple-500 px-8 py-10 text-white">
            <p className="text-sm font-black uppercase tracking-wide text-purple-100">
              Creator Membership
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Join {creator}&apos;s Community
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-purple-100">
              Support this creator through recurring membership and unlock
              exclusive experiences, premium content, community access, and
              future member-only benefits on NiaTube.
            </p>
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="overflow-hidden rounded-2xl bg-black shadow-sm">
                <div className="flex aspect-video items-center justify-center bg-gray-900 text-center text-white">
                  <div>
                    <p className="text-sm font-bold uppercase text-purple-300">
                      Membership Intro Video
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      Creator Welcome Message
                    </h2>

                    <p className="mt-3 px-6 text-sm text-gray-300">
                      A short creator message explaining why viewers should join
                      the membership community will appear here.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border bg-gray-50 p-6">
                <h2 className="text-2xl font-black text-gray-900">
                  Membership Benefits
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {[
                    ["Exclusive Content", "Access premium creator videos, livestreams, and special releases."],
                    ["Community Access", "Join deeper creator discussions and future private member spaces."],
                    ["Early Access", "Watch selected creator uploads before public release."],
                    ["Direct Support", "Help creators grow independently on NiaTube."],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-xl bg-white p-4 shadow-sm">
                      <h3 className="text-lg font-black text-gray-900">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside>
              <div className="mb-6">
  <label className="text-sm font-black text-gray-700">
    Viewing From
  </label>

  <select
  value={viewerCountry}
  onChange={(e) => setViewerCountry(e.target.value)}
  className="mt-2 w-full rounded-xl border px-4 py-3"
>
  <optgroup label="North Africa">
    <option value="DZ">Algeria</option>
    <option value="EG">Egypt</option>
    <option value="LY">Libya</option>
    <option value="MA">Morocco</option>
    <option value="SD">Sudan</option>
    <option value="TN">Tunisia</option>
  </optgroup>

  <optgroup label="West Africa">
    <option value="BJ">Benin</option>
    <option value="BF">Burkina Faso</option>
    <option value="CV">Cabo Verde</option>
    <option value="CI">Côte d'Ivoire</option>
    <option value="GM">Gambia</option>
    <option value="GH">Ghana</option>
    <option value="GN">Guinea</option>
    <option value="GW">Guinea-Bissau</option>
    <option value="LR">Liberia</option>
    <option value="ML">Mali</option>
    <option value="NE">Niger</option>
    <option value="NG">Nigeria</option>
    <option value="SN">Senegal</option>
    <option value="SL">Sierra Leone</option>
    <option value="TG">Togo</option>
  </optgroup>

  <optgroup label="Central Africa">
    <option value="AO">Angola</option>
    <option value="CM">Cameroon</option>
    <option value="CF">Central African Republic</option>
    <option value="TD">Chad</option>
    <option value="CD">Democratic Republic of the Congo</option>
    <option value="GQ">Equatorial Guinea</option>
    <option value="GA">Gabon</option>
    <option value="CG">Republic of the Congo</option>
    <option value="ST">São Tomé and Príncipe</option>
  </optgroup>

  <optgroup label="East Africa">
    <option value="BI">Burundi</option>
    <option value="KM">Comoros</option>
    <option value="DJ">Djibouti</option>
    <option value="ER">Eritrea</option>
    <option value="ET">Ethiopia</option>
    <option value="KE">Kenya</option>
    <option value="MU">Mauritius</option>
    <option value="RW">Rwanda</option>
    <option value="SC">Seychelles</option>
    <option value="SO">Somalia</option>
    <option value="SS">South Sudan</option>
    <option value="TZ">Tanzania</option>
    <option value="UG">Uganda</option>
  </optgroup>

  <optgroup label="Southern Africa">
    <option value="BW">Botswana</option>
    <option value="SZ">Eswatini</option>
    <option value="LS">Lesotho</option>
    <option value="MG">Madagascar</option>
    <option value="MW">Malawi</option>
    <option value="MZ">Mozambique</option>
    <option value="NA">Namibia</option>
    <option value="ZA">South Africa</option>
    <option value="ZM">Zambia</option>
    <option value="ZW">Zimbabwe</option>
  </optgroup>

  <optgroup label="Diaspora">
    <option value="US">United States</option>
    <option value="GB">United Kingdom</option>
    <option value="FR">France</option>
  </optgroup>
</select>
  <p className="mt-3 text-sm font-bold text-gray-600">
    Membership Currency: {membershipCurrency}
  </p>
</div>
              <div className="rounded-2xl border bg-white p-6 shadow-sm">

                <p className="text-sm font-black uppercase text-purple-600">
                  Membership Tier
                </p>

                <h2 className="mt-2 text-3xl font-black text-gray-900">
                  Supporter
                </h2>

               <p className="mt-2 text-4xl font-black text-purple-700">
  {membershipCurrency} {membershipAmount.toLocaleString()}
  <span className="text-lg text-gray-500">/month</span>
</p>
                <ul className="mt-6 space-y-3 text-sm text-gray-700">
                  <li>✔ Exclusive creator updates</li>
                  <li>✔ Future premium content access</li>
                  <li>✔ Priority community engagement</li>
                  <li>✔ Support creator growth directly</li>
                </ul>

                <button
                  type="button"
                  onClick={joinMembership}
                  disabled={joining}
                  className="mt-8 w-full rounded-2xl bg-purple-600 px-6 py-4 text-sm font-black text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joining ? "Starting Membership..." : "Continue to Membership Signup"}
                </button>

                {statusMessage && (
                  <p className="mt-4 text-center text-sm font-bold text-purple-700">
                    {statusMessage}
                  </p>
                )}

                <p className="mt-4 text-center text-xs text-gray-500">
                  Payment integration and recurring billing will be connected in
                  the next phase.
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-black p-6 text-white">
                <p className="text-sm font-black uppercase text-yellow-400">
                  Creator Economy
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Build Sustainable Creator Income
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-300">
                  Memberships help creators build recurring revenue directly
                  from their audience and community.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}