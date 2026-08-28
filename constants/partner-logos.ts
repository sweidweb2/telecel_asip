export type PartnerLogo = {
  name: string;
  src: string;
};

/**
 * Partner marks from `public/partners` (transparent PNG).
 * ASIP’s own lockup is omitted. Publication permission remains a Telecel/legal check.
 */
export const PARTNER_LOGOS: PartnerLogo[] = [
  { name: "Accelerator²", src: "/partners/a2.png" },
  { name: "AWS", src: "/partners/aws.png" },
  { name: "Cloudworx", src: "/partners/cloudworx.png" },
  { name: "DER", src: "/partners/der.png" },
  { name: "d-hub", src: "/partners/dhub.png" },
  { name: "Firstbase", src: "/partners/firstbase.png" },
  { name: "FMO Ventures", src: "/partners/fmo-ventures.png" },
  { name: "Freshworks", src: "/partners/freshworks.png" },
  { name: "Google Cloud", src: "/partners/google-cloud.png" },
  { name: "HubSpot", src: "/partners/hubspot.png" },
  { name: "Miro", src: "/partners/miro.png" },
  { name: "Startupbootcamp AfriTech", src: "/partners/sbc-afritech.png" },
  { name: "VC4A", src: "/partners/vc4a.png" },
];
