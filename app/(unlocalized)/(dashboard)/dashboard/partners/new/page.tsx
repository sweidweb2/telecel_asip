import type { Metadata } from "next";

import {
  CmsEditorPage,
  type CmsEditorLoadResult,
} from "@/components/dashboard/cms-editor-page";
import { PartnerEditorForm } from "@/components/partners/partner-editor-form";
import { ROUTES } from "@/constants/routes";
import { requireEditor } from "@/data/auth";
import { getPartnerSortOrderOccupants } from "@/data/partners";
import type { PartnerSortOrderOccupant } from "@/types/partner";

export const metadata: Metadata = {
  title: "New partner | ASIP Editor",
};

export default async function NewPartnerPage() {
  await requireEditor();

  return (
    <CmsEditorPage
      listPath={ROUTES.partners}
      listLabel="Partners"
      pageLabel="New partner"
      load={async (): Promise<
        CmsEditorLoadResult<{
          status: "ok";
          orderSlots: PartnerSortOrderOccupant[];
        }>
      > => {
        const orderResult = await getPartnerSortOrderOccupants();
        if (orderResult.status === "forbidden") return { status: "forbidden" };
        return { status: "ok", orderSlots: orderResult.partners };
      }}
    >
      {(record) => (
        <PartnerEditorForm
          mode="create"
          heading="New partner"
          orderSlots={record.orderSlots}
        />
      )}
    </CmsEditorPage>
  );
}
