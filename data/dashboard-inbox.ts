import { fetchAdminListStats } from "@/data/admin-list-stats";
import { gatePageDataByRole } from "@/lib/admin/admin-list-query";

export type DashboardInboxUnread = {
  registrations: number;
  applications: number;
  investorInterests: number;
  investorEngagements: number;
  contactMessages: number;
};

/**
 * Unread intake totals for the editor home cards.
 * Uses the per-resource list-stats caches (already busted by intake writes)
 * instead of the full `get_admin_analytics` snapshot.
 */
export async function getDashboardInboxUnread(): Promise<
  { status: "forbidden" } | { status: "ok"; unread: DashboardInboxUnread }
> {
  const gated = await gatePageDataByRole("editor", async (supabase) => {
    const [
      registrations,
      applications,
      investorInterests,
      investorEngagements,
      contactMessages,
    ] = await Promise.all([
      fetchAdminListStats(supabase, "interest_registrations", ["unread"]),
      fetchAdminListStats(supabase, "applications", ["unread"]),
      fetchAdminListStats(supabase, "investor_interests", ["unread"]),
      fetchAdminListStats(supabase, "investor_engagements", ["unread"]),
      fetchAdminListStats(supabase, "contact_messages", ["unread"]),
    ]);

    return {
      unread: {
        registrations: registrations.unread,
        applications: applications.unread,
        investorInterests: investorInterests.unread,
        investorEngagements: investorEngagements.unread,
        contactMessages: contactMessages.unread,
      },
    };
  });

  if (gated.status === "forbidden") return gated;
  return { status: "ok", unread: gated.unread };
}
