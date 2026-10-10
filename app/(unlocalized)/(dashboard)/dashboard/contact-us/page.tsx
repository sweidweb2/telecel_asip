import type { Metadata } from "next";

import { ContactMessagesTable } from "@/components/contact-messages/contact-messages-table";
import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
import { InboxStatsCards } from "@/components/dashboard/inbox-stats-cards";
import { getAdminResource } from "@/constants/admin-resources";
import { getContactMessagesPageData } from "@/data/contact-messages";
import { parseContactMessageListQuery } from "@/validations/contact-message";

const resource = getAdminResource("contactUs");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type ContactUsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ContactUsPage({ searchParams }: ContactUsPageProps) {
  return (
    <CmsListPage
      resourceId="contactUs"
      searchParams={searchParams}
      parseQuery={parseContactMessageListQuery}
      fetchPage={getContactMessagesPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        enquiryType:
          query.enquiryType !== "all" ? query.enquiryType : undefined,
        inboxStatus:
          query.inboxStatus !== "inbox" ? query.inboxStatus : undefined,
      })}
      actions={
        <InboxCsvDownloadLink href="/api/admin/export/contact_messages" />
      }
      stats={(result) => <InboxStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <ContactMessagesTable
          messages={result.list.messages}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
