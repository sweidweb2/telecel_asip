import type { Metadata } from "next";

import {
  CmsEditorPage,
  type CmsEditorLoadResult,
} from "@/components/dashboard/cms-editor-page";
import { PartnerEditorForm } from "@/components/partners/partner-editor-form";
import { ROUTES } from "@/constants/routes";
import type { Partner, PartnerSortOrderOccupant } from "@/types/partner";
import {
  getPartnerByIdForAdmin,
  getPartnerSortOrderOccupants,
} from "@/data/partners";

type EditPartnerPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditPartnerPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPartnerByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Partner | ASIP Editor" };
  }
  return { title: `${result.partner.name} | ASIP Editor` };
}

export default async function EditPartnerPage({
  params,
}: EditPartnerPageProps) {
  const { id } = await params;

  return (
    <CmsEditorPage
      listPath={ROUTES.partners}
      listLabel="Partners"
      pageLabel={(record) => record.partner.name}
      load={async (): Promise<
        CmsEditorLoadResult<{
          status: "ok";
          partner: Partner;
          orderSlots: PartnerSortOrderOccupant[];
        }>
      > => {
        const [result, orderResult] = await Promise.all([
          getPartnerByIdForAdmin(id),
          getPartnerSortOrderOccupants(),
        ]);

        if (
          result.status === "forbidden" ||
          orderResult.status === "forbidden"
        ) {
          return { status: "forbidden" };
        }
        if (result.status === "not_found") return { status: "not_found" };
        return {
          status: "ok",
          partner: result.partner,
          orderSlots: orderResult.partners,
        };
      }}
    >
      {(record) => (
        <PartnerEditorForm
          mode="edit"
          partner={record.partner}
          heading="Edit partner"
          orderSlots={record.orderSlots}
        />
      )}
    </CmsEditorPage>
  );
}
