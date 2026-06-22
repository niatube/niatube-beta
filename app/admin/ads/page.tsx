import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdEvent = {
  ad_id: string | null;
  event_type: string | null;
  placement: string | null;
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
    .select("ad_id, event_type, placement")
    .order("ad_id", { ascending: true });

  const adEvents: AdEvent[] = events || [];

  const campaignMap = new Map<
    string,
    { campaign: string; impressions: number; clicks: number }
  >();

  const placementMap = new Map<
    string,
    {
      campaign: string;
      placement: string;
      impressions: number;
      clicks: number;
    }
  >();

  adEvents.forEach((event) => {
    const campaign = event.ad_id || "Unknown Campaign";
    const placement = event.placement || "Unassigned";

    if (!campaignMap.has(campaign)) {
      campaignMap.set(campaign, {
        campaign,
        impressions: 0,
        clicks: 0,
      });
    }

    const campaignRow = campaignMap.get(campaign);

    if (campaignRow) {
      if (event.event_type === "impression") campaignRow.impressions += 1;
      if (event.event_type === "click") campaignRow.clicks += 1;
    }

    const placementKey = `${campaign}-${placement}`;

    if (!placementMap.has(placementKey)) {
      placementMap.set(placementKey, {
        campaign,
        placement,
        impressions: 0,
        clicks: 0,
      });
    }

    const placementRow = placementMap.get(placementKey);

    if (placementRow) {
      if (event.event_type === "impression") placementRow.impressions += 1;
      if (event.event_type === "click") placementRow.clicks += 1;
    }
  });

  const campaigns = Array.from(campaignMap.values()).sort(
    (a, b) => b.impressions - a.impressions
  );

  const placements = Array.from(placementMap.values()).sort(
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
              Track campaign impressions, clicks, CTR, and placement-level
              performance across NiaTube.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
          >
            Back to Admin
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
          <h2 className="text-2xl font-black">Campaign Reporting</h2>
          <p className="mt-1 text-sm text-gray-600">
            Overall campaign totals across all placements.
          </p>

          <div className="mt-5 overflow-x-auto">
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
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Placement Reporting</h2>
          <p className="mt-1 text-sm text-gray-600">
            Compare performance by Homepage, Watch Page, Live Page, and future
            ad placements.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 pr-4">Campaign</th>
                  <th className="py-3 pr-4">Placement</th>
                  <th className="py-3 pr-4">Impressions</th>
                  <th className="py-3 pr-4">Clicks</th>
                  <th className="py-3 pr-4">CTR</th>
                </tr>
              </thead>

              <tbody>
                {placements.map((row) => (
                  <tr
                    key={`${row.campaign}-${row.placement}`}
                    className="border-b"
                  >
                    <td className="py-4 pr-4 font-bold">{row.campaign}</td>
                    <td className="py-4 pr-4">{row.placement}</td>
                    <td className="py-4 pr-4">
                      {formatNumber(row.impressions)}
                    </td>
                    <td className="py-4 pr-4">{formatNumber(row.clicks)}</td>
                    <td className="py-4 pr-4 font-bold">
                      {formatCtr(row.clicks, row.impressions)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}