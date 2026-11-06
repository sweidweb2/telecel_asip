/**
 * One-off seed: insert partners with logos from /public/partners.
 *
 * Usage (from repo root):
 *   node --env-file=.env --env-file=.env.local scripts/seed-partners.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Logos are static app files (/partners/*.png), not Storage uploads.
 */
import { createClient } from "@supabase/supabase-js";

const SEED_PARTNERS = [
  {
    name: "Accelerator²",
    org: null,
    type: "corporate",
    contribution:
      "Corporate innovation briefs and pilots with ASIP founders.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/a2.png",
    link: null,
    sort_order: 10,
  },
  {
    name: "ASIP",
    org: "Telecel Group",
    type: "media",
    contribution:
      "Program brand presence across ecosystem events and founder showcases.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/asip.png",
    link: null,
    sort_order: 20,
  },
  {
    name: "AWS",
    org: "Amazon Web Services",
    type: "technology",
    contribution:
      "Cloud credits, architecture reviews and technical workshops.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/aws.png",
    link: "https://aws.amazon.com",
    sort_order: 30,
  },
  {
    name: "Cloudworx",
    org: null,
    type: "technology",
    contribution:
      "Cloud and infrastructure expertise for early-stage technical teams.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/cloudworx.png",
    link: null,
    sort_order: 40,
  },
  {
    name: "DER",
    org: null,
    type: "development",
    contribution:
      "Development-sector collaboration and market access pathways.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/der.png",
    link: null,
    sort_order: 50,
  },
  {
    name: "DHub",
    org: null,
    type: "technology",
    contribution:
      "Digital hub programs and founder community connections.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/dhub.png",
    link: null,
    sort_order: 60,
  },
  {
    name: "Firstbase",
    org: null,
    type: "technology",
    contribution:
      "Remote operations tooling for distributed founding teams.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/firstbase.png",
    link: "https://www.firstbase.io",
    sort_order: 70,
  },
  {
    name: "FMO Ventures",
    org: "FMO",
    type: "investors",
    contribution:
      "Investment-readiness dialogue and portfolio introductions.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/fmo-ventures.png",
    link: "https://www.fmo.nl",
    sort_order: 80,
  },
  {
    name: "Freshworks",
    org: null,
    type: "technology",
    contribution:
      "Customer engagement software credits and product workshops.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/freshworks.png",
    link: "https://www.freshworks.com",
    sort_order: 90,
  },
  {
    name: "Google Cloud",
    org: "Google",
    type: "technology",
    contribution:
      "Cloud credits, architecture guidance and technical enablement.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/google-cloud.png",
    link: "https://cloud.google.com",
    sort_order: 100,
  },
  {
    name: "HubSpot",
    org: null,
    type: "technology",
    contribution:
      "CRM and go-to-market tooling for founder commercial teams.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/hubspot.png",
    link: "https://www.hubspot.com",
    sort_order: 110,
  },
  {
    name: "Miro",
    org: null,
    type: "technology",
    contribution:
      "Collaborative workspace access for workshops and cohort delivery.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/miro.png",
    link: "https://miro.com",
    sort_order: 120,
  },
  {
    name: "Startupbootcamp AfriTech",
    org: null,
    type: "development",
    contribution:
      "Sector programs and cohort delivery across African markets.",
    is_active: true,
    logo_permission: true,
    logo_url: "/partners/sbc-afritech.png",
    link: null,
    sort_order: 130,
  },
  {
    name: "VC4A",
    org: null,
    type: "media",
    contribution: "Ecosystem research and founder showcases.",
    is_active: false,
    logo_permission: true,
    logo_url: "/partners/vc4a.png",
    link: "https://vc4a.com",
    sort_order: 140,
  },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env --env-file=.env.local).",
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const partner of SEED_PARTNERS) {
    process.stdout.write(`Seeding ${partner.name}… `);

    const { data: existing } = await supabase
      .from("partners")
      .select("id")
      .eq("name", partner.name)
      .maybeSingle();

    if (existing) {
      console.log("skip (name exists)");
      continue;
    }

    const { error } = await supabase.from("partners").insert(partner);
    if (error) {
      console.log("FAILED");
      throw error;
    }
    console.log("ok");
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
