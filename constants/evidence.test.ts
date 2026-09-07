import { describe, expect, it } from "vitest";

import { ASIP_EVIDENCE, publicApprovedEvidence } from "@/constants/evidence";

describe("publicApprovedEvidence", () => {
  it("never exposes pending or internal evidence", () => {
    expect(publicApprovedEvidence(ASIP_EVIDENCE)).toEqual([]);
  });

  it("returns only approved public claims", () => {
    const publicMetric = { ...ASIP_EVIDENCE[0]!, approvalStatus: "approved" as const, visibility: "public" as const };
    expect(publicApprovedEvidence([...ASIP_EVIDENCE, publicMetric])).toEqual([publicMetric]);
  });
});
