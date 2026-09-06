import { describe, expect, it } from "vitest";

import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

describe("buildMarketingMetadata", () => {
  it("sets robots noIndex when requested", () => {
    const metadata = buildMarketingMetadata({
      locale: "en",
      path: "/apply",
      title: "Apply",
      description: "Apply to ASIP",
      noIndex: true,
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toBe("Apply");
  });

  it("omits robots when indexable", () => {
    const metadata = buildMarketingMetadata({
      locale: "fr",
      path: "/about",
      title: "À propos",
      description: "About ASIP",
    });

    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates?.canonical).toContain("/fr/about");
    expect(
      (metadata.openGraph as { type?: string } | undefined)?.type,
    ).toBe("website");
  });

  it("uses article og type when requested", () => {
    const metadata = buildMarketingMetadata({
      locale: "en",
      path: "/insights/hello",
      title: "Hello",
      description: "Insight",
      ogType: "article",
      image: "/custom.png",
    });

    expect(
      (metadata.openGraph as { type?: string } | undefined)?.type,
    ).toBe("article");
    expect(metadata.twitter?.images).toEqual(["/custom.png"]);
  });
});
