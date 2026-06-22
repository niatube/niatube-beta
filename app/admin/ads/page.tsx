import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdEvent = {
  ad_id: string | null;
  event_type: string | null;
};

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString();
}

function formatCtr(clicks: number, impressions: number) {
  if (!impressions) return "0.00%";
  return `${((clicks / impressions) * 100).toFixed(2)}%`;
}

export default async function AdminAdsPage() {
  const supabase = getSupabaseAdmin();

  const { data: events, error } = await supabase
    .from("ad_events")
    .select("ad_id, event_type")
    .order("ad_id", { ascending: true });

  const adEvents: AdEvent[] = events || [];

  const campaignMap = new Map<
    string,
    { campaign: string; impressions: number; clicks: number }
  >();

  adEvents.forEach((event) => {
    const campaign = event.ad_id || "Unknown Campaign";

    if (!campaignMap.has(campaign)) {
      campaignMap.set(campaign, {
        campaign,
        impressions: 0,
        clicks: 0,
      });
    }

    const row = campaignMap.get(campaign);

    if (!row) return;

    if (event.event_type === "impression") {
      row.impressions += 1;
    }

    if (event.event_type === "click") {
      row.clicks += 1;
    }
  });

  const campaigns = Array.from(campaignMap.values()).sort(
    (a, b) => b.impressions - a.impressions
  );

  const totalCampaigns = campaigns.length;
  const totalImpressions = campaigns.reduce(
    (sum, item) => sum + item.impressions,
    0
  );
  const totalClicks = campaigns.reduce((sum, item) => sum + item.clicks, 0);
  const averageCtr = formatCtr(totalClicks, totalImpressions);

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-green-700">
              Operations
            </p>
            <h1 className="mt-2 text-4xl font-black">
              Advertising Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Track campaign impressions, clicks, and CTR across NiaTube ad
              placements.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
          >
            Back to Homepage
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
            Failed to load advertising analytics: {error.message}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Campaigns</p>
            <p className="mt-3 text-3xl font-black">
              {formatNumber(totalCampaigns)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">
              Total Impressions
            </p>
            <p className="mt-3 text-3xl font-black">
              {formatNumber(totalImpressions)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Total Clicks</p>
            <p className="mt-3 text-3xl font-black">
              {formatNumber(totalClicks)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-500">Average CTR</p>
            <p className="mt-3 text-3xl font-black">{averageCtr}</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Campaign Reporting</h2>
              <p className="mt-1 text-sm text-gray-600">
                One impression equals one recorded ad display.
              </p>
            </div>
          </div>

          {campaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-lg font-bold">No ad events recorded yet.</p>
              <p className="mt-2 text-sm text-gray-600">
                Visit the Homepage with a live ad to generate the first
                impression.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-3 pr-4">Campaign</th>
                    <th className="py-3 pr-4">Impressions</th>
                    <th className="py-3 pr-4">Clicks</th>
                    <th className="py-3 pr-4">CTR</th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.campaign} className="border-b">
                      <td className="py-4 pr-4 font-bold">
                        {campaign.campaign}
                      </td>
                      <td className="py-4 pr-4">
                        {formatNumber(campaign.impressions)}
                      </td>
                      <td className="py-4 pr-4">
                        {formatNumber(campaign.clicks)}
                      </td>
                      <td className="py-4 pr-4 font-bold">
                        {formatCtr(campaign.clicks, campaign.impressions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}