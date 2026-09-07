import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
import { InboxStatsCards } from "@/components/dashboard/inbox-stats-cards";
import { ContactMessagesTable } from "@/components/contact-messages/contact-messages-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getContactMessagesPageData } from "@/data/contact-messages";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseContactMessageListQuery } from "@/validations/contact-message";

const resource = getAdminResource("contactUs");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type ContactUsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContactUsPage({
  searchParams,
}: ContactUsPageProps) {
  const query = parseContactMessageListQuery(await searchParams);
  const { list, stats } = await loadAdminListPage({
    query,
    fetchPage: getContactMessagesPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
        enquiryType: q.enquiryType !== "all" ? q.enquiryType : undefined,
        inboxStatus: q.inboxStatus !== "inbox" ? q.inboxStatus : undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      actions={
        <InboxCsvDownloadLink href="/api/admin/export/contact_messages" />
      }
    >
      <InboxStatsCards stats={stats} />
      <ContactMessagesTable
        messages={list.messages}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
