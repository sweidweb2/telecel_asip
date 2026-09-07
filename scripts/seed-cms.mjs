/**
 * One-off seed: CMS portfolio content + inbox load data.
 *
 * Seeds (idempotent):
 *   startups (+ details + logo Storage uploads), founder_stories, cohorts
 *   (+ junctions), evidence_records, impact_metrics, events (+ junctions),
 *   applications, interest_registrations, contact_messages
 *
 * Usage (from repo root):
 *   node --env-file=.env --env-file=.env.local scripts/seed-cms.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Reuses partners (by name) and seed admin profile (asweid657@gmail.com).
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

const SEED_ADMIN_EMAIL = "asweid657@gmail.com";
const LOGO_BUCKET = "startups";
const WEBP_QUALITY = 80;
const STARTUP_LOGO_MAX_WIDTH = 512;
const INBOX_COUNT = 250;
const BATCH_SIZE = 50;
const SEED_EVIDENCE_PREFIX = "[SEED] ";

const COVER_URLS = [
  "https://www.untitledui.com/marketing/blog-featured-post-01.webp",
  "https://www.untitledui.com/marketing/spirals.webp",
  "https://www.untitledui.com/marketing/conversation.webp",
  "https://www.untitledui.com/blog/two-mobile-shapes-pattern.webp",
  "https://www.untitledui.com/blog/two-people.webp",
  "https://www.untitledui.com/marketing/sythesize.webp",
];

const LOGO_URLS = [
  "https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80",
  "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80",
  "https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80",
  "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80",
  "https://www.untitledui.com/images/avatars/alec-whitten?fm=webp&q=80",
  "https://www.untitledui.com/images/avatars/natali-craig?fm=webp&q=80",
  "https://www.untitledui.com/images/avatars/drew-cano?fm=webp&q=80",
  "https://www.untitledui.com/images/avatars/orlando-diggs?fm=webp&q=80",
];

const PARTNER_NAMES = [
  "Accelerator²",
  "ASIP",
  "AWS",
  "Cloudworx",
  "DER",
  "DHub",
  "Firstbase",
  "FMO Ventures",
  "Freshworks",
  "Google Cloud",
  "HubSpot",
  "Miro",
  "Startupbootcamp AfriTech",
];

/** @type {Array<Record<string, unknown>>} */
const SEED_STARTUPS = [
  {
    slug: "seed-paystack-lite",
    name: "KudiLink",
    description:
      "Cross-border payout rails that settle SME supplier invoices across West African corridors in under two hours.",
    status: "active",
    founded_at: "2021-03-15",
    details: {
      website_url: "https://example.com/kudilink",
      industry: "Fintech",
      category: "Payments",
      location: "Lagos, Nigeria",
      cohort: "ASIP 2023",
      country_code: "NG",
      sector: "Fintech",
      founder_names: ["Ada Okonkwo", "Chidi Nwosu"],
      public_outcome:
        "Processed $18M in supplier payouts across NG–GH–CI corridors in 2025.",
      featured: true,
      founding_year: 2021,
      problem:
        "SME exporters wait days for corridor payouts and lose margin to FX spreads.",
      solution:
        "API payouts with local settlement partners and transparent FX quotes.",
      target_market: "Export SMEs and marketplace operators in West Africa",
      business_model: "Per-payout fee + FX spread share",
    },
  },
  {
    slug: "seed-farmtrace",
    name: "FarmTrace",
    description:
      "Traceability software that lets agrifood buyers verify farm origin, quality checks, and cold-chain handoffs.",
    status: "active",
    founded_at: "2020-08-01",
    details: {
      website_url: "https://example.com/farmtrace",
      industry: "AgriTech",
      category: "Supply chain",
      location: "Nairobi, Kenya",
      cohort: "ASIP 2022",
      country_code: "KE",
      sector: "AgriTech",
      founder_names: ["Wanjiru Kamau"],
      public_outcome:
        "Onboarded 4,200 smallholder farms supplying three regional processors.",
      featured: true,
      founding_year: 2020,
      problem: "Buyers cannot prove origin or cold-chain integrity at scale.",
      solution: "Mobile capture + QR batch certificates for farm-to-buyer lots.",
      target_market: "Processors and exporters of fresh produce",
      business_model: "SaaS per facility + per-lot certificate fees",
    },
  },
  {
    slug: "seed-mediroute",
    name: "MediRoute",
    description:
      "Last-mile pharmacy logistics that routes temperature-sensitive stock to clinics across Greater Accra.",
    status: "active",
    founded_at: "2022-01-20",
    details: {
      industry: "HealthTech",
      category: "Logistics",
      location: "Accra, Ghana",
      cohort: "ASIP 2023",
      country_code: "GH",
      sector: "HealthTech",
      founder_names: ["Kwame Mensah", "Ama Boateng"],
      public_outcome: "Cut average clinic restock time from 48h to 11h.",
      featured: false,
      founding_year: 2022,
      problem: "Clinics stock out because distributors run rigid delivery windows.",
      solution: "Dynamic routing with cold-box telemetry for pharmacy fleets.",
      target_market: "Pharmacy chains and private clinics",
      business_model: "Delivery fee + monthly fleet software",
    },
  },
  {
    slug: "seed-solargrid-ops",
    name: "GridPulse",
    description:
      "Operations software for mini-grid operators to forecast demand, dispatch technicians, and reduce downtime.",
    status: "active",
    founded_at: "2019-11-05",
    details: {
      industry: "CleanTech",
      category: "Energy",
      location: "Kigali, Rwanda",
      cohort: "ASIP 2022",
      country_code: "RW",
      sector: "CleanTech",
      founder_names: ["Jean Uwimana"],
      public_outcome: "Reduced unplanned outages by 37% across 18 mini-grids.",
      featured: true,
      founding_year: 2019,
      problem: "Mini-grid operators fly blind on load spikes and field tickets.",
      solution: "SCADA-lite dashboards with predictive work orders.",
      target_market: "Rural electrification operators",
      business_model: "Per-site SaaS subscription",
    },
  },
  {
    slug: "seed-edusprint",
    name: "EduSprint",
    description:
      "Workforce training marketplace that matches employers with modular digital skills programmes.",
    status: "active",
    founded_at: "2021-06-10",
    details: {
      industry: "EdTech",
      category: "Learning",
      location: "Cape Town, South Africa",
      cohort: "ASIP 2024",
      country_code: "ZA",
      sector: "EdTech",
      founder_names: ["Thandi Ndlovu", "Sipho Dlamini"],
      public_outcome: "Placed 1,100 learners into paid roles with partner employers.",
      featured: false,
      founding_year: 2021,
      problem: "Employers cannot fill junior digital roles fast enough.",
      solution: "Cohort courses with employer-backed hiring pipelines.",
      target_market: "SMEs hiring ops, sales, and support talent",
      business_model: "B2B course fees + placement success fee",
    },
  },
  {
    slug: "seed-cargoos",
    name: "CargoOS",
    description:
      "Freight coordination for cross-border trucking with live document checks and lane pricing.",
    status: "active",
    founded_at: "2020-02-14",
    details: {
      industry: "Logistics",
      category: "Freight",
      location: "Abidjan, Côte d'Ivoire",
      cohort: "ASIP 2023",
      country_code: "CI",
      sector: "Logistics",
      founder_names: ["Fatou Diop"],
      public_outcome: "Digitised 22,000 border document packs in 2025.",
      featured: false,
      founding_year: 2020,
      problem: "Shippers lose days to paper checks and opaque lane rates.",
      solution: "Shared freight OS with document templates and rate boards.",
      target_market: "3PLs and manufacturers moving goods ECOWAS-wide",
      business_model: "Transaction fee on booked loads",
    },
  },
  {
    slug: "seed-retailpulse",
    name: "RetailPulse",
    description:
      "Inventory and demand tools for informal retail chains stocking fast-moving consumer goods.",
    status: "active",
    founded_at: "2022-09-01",
    details: {
      industry: "RetailTech",
      category: "Inventory",
      location: "Kampala, Uganda",
      cohort: "ASIP 2024",
      country_code: "UG",
      sector: "RetailTech",
      founder_names: ["Aisha Namutebi"],
      public_outcome: "Cut stockouts 28% for a 600-shop retail network.",
      featured: false,
      founding_year: 2022,
      problem: "Shop owners over-order slow SKUs and understock bestsellers.",
      solution: "WhatsApp-first inventory with demand nudges.",
      target_market: "Multi-shop FMCG retailers",
      business_model: "Monthly SaaS per shop cluster",
    },
  },
  {
    slug: "seed-insurebaobab",
    name: "Baobab Cover",
    description:
      "Parametric microinsurance for small traders covering flood and fire events with mobile claims.",
    status: "active",
    founded_at: "2021-04-22",
    details: {
      industry: "InsurTech",
      category: "Insurance",
      location: "Dakar, Senegal",
      cohort: "ASIP 2022",
      country_code: "SN",
      sector: "InsurTech",
      founder_names: ["Moussa Fall", "Awa Ndiaye"],
      public_outcome: "Paid 9,400 claims with average settlement under 72 hours.",
      featured: false,
      founding_year: 2021,
      problem: "Informal traders cannot insure shop stock affordably.",
      solution: "Parametric triggers + mobile money payouts.",
      target_market: "Market traders and kiosk owners",
      business_model: "Premium share with underwriting partners",
    },
  },
  {
    slug: "seed-waterops",
    name: "AquaOps",
    description:
      "Utility ops platform that detects leaks and schedules maintenance for urban water networks.",
    status: "active",
    founded_at: "2018-07-30",
    details: {
      industry: "ClimateTech",
      category: "Utilities",
      location: "Addis Ababa, Ethiopia",
      cohort: "ASIP 2021",
      country_code: "ET",
      sector: "ClimateTech",
      founder_names: ["Helen Bekele"],
      public_outcome: "Recovered 1.2M litres/day of non-revenue water for one utility.",
      featured: false,
      founding_year: 2018,
      problem: "Utilities lose water to undetected leaks and delayed repairs.",
      solution: "Sensor analytics with crew dispatch scoring.",
      target_market: "Municipal water utilities",
      business_model: "Enterprise license + sensors",
    },
  },
  {
    slug: "seed-talentbridge",
    name: "TalentBridge Africa",
    description:
      "Contract hiring platform connecting diaspora specialists with African startups for fractional roles.",
    status: "active",
    founded_at: "2023-02-11",
    details: {
      industry: "HRTech",
      category: "Talent",
      location: "Remote / Johannesburg",
      cohort: "ASIP 2024",
      country_code: "ZA",
      sector: "HRTech",
      founder_names: ["Nia Okello"],
      public_outcome: "Matched 320 fractional engagements in first 18 months.",
      featured: false,
      founding_year: 2023,
      problem: "Startups need senior talent without full-time payroll load.",
      solution: "Curated fractional marketplace with compliance tooling.",
      target_market: "Series A–B startups hiring product and growth leads",
      business_model: "Marketplace take rate",
    },
  },
  {
    slug: "seed-climateledger",
    name: "ClimateLedger",
    description:
      "MRV software that packages project data for carbon buyers without inventing impact claims.",
    status: "active",
    founded_at: "2022-05-18",
    details: {
      industry: "ClimateTech",
      category: "MRV",
      location: "Accra, Ghana",
      cohort: "ASIP 2024",
      country_code: "GH",
      sector: "ClimateTech",
      founder_names: ["Kojo Asante", "Efua Mensah"],
      public_outcome: "Supported 14 projects through third-party verification prep.",
      featured: false,
      founding_year: 2022,
      problem: "Project developers drown in spreadsheet MRV before audits.",
      solution: "Structured data rooms aligned to verifier checklists.",
      target_market: "Nature and cookstove project developers",
      business_model: "Per-project SaaS",
    },
  },
  {
    slug: "seed-fleetfix",
    name: "FleetFix",
    description:
      "Predictive maintenance for commercial fleets using telematics and workshop marketplace booking.",
    status: "inactive",
    founded_at: "2019-01-09",
    details: {
      industry: "Mobility",
      category: "Fleet",
      location: "Lagos, Nigeria",
      cohort: "ASIP 2021",
      country_code: "NG",
      sector: "Mobility",
      founder_names: ["Ibrahim Bello"],
      public_outcome: "Pilot reduced roadside breakdowns 22% for one logistics fleet.",
      featured: false,
      founding_year: 2019,
      problem: "Fleets schedule maintenance late and lose revenue on downtime.",
      solution: "Telematics alerts + workshop booking.",
      target_market: "Mid-size logistics fleets",
      business_model: "Per-vehicle SaaS",
    },
  },
  {
    slug: "seed-healthkit-lab",
    name: "LabLink",
    description:
      "Diagnostics orchestration that routes lab orders and returns results to clinics in hours.",
    status: "draft",
    founded_at: "2024-01-08",
    details: {
      industry: "HealthTech",
      category: "Diagnostics",
      location: "Nairobi, Kenya",
      cohort: "ASIP 2025",
      country_code: "KE",
      sector: "HealthTech",
      founder_names: ["Grace Wambui"],
      public_outcome: null,
      featured: false,
      founding_year: 2024,
      problem: "Clinics wait days for lab results from fragmented partners.",
      solution: "Order routing API across partner labs.",
      target_market: "Outpatient clinics and telehealth providers",
      business_model: "Per-test platform fee",
    },
  },
  {
    slug: "seed-marketmesh",
    name: "MarketMesh",
    description:
      "B2B wholesale matching for FMCG distributors and independent retailers with credit scoring.",
    status: "active",
    founded_at: "2020-10-03",
    details: {
      industry: "Commerce",
      category: "Wholesale",
      location: "Accra, Ghana",
      cohort: "ASIP 2023",
      country_code: "GH",
      sector: "Commerce",
      founder_names: ["Yaw Owusu"],
      public_outcome: "GMV of $41M across retailer orders in 2025.",
      featured: false,
      founding_year: 2020,
      problem: "Independent retailers lack reliable wholesale credit and stock.",
      solution: "Order app with distributor inventory + short-term credit.",
      target_market: "Independent grocery and pharmacy retailers",
      business_model: "Take rate + credit interest share",
    },
  },
  {
    slug: "seed-buildcost",
    name: "BuildCost",
    description:
      "Construction cost intelligence that benchmarks materials and labour for mid-rise developers.",
    status: "draft",
    founded_at: "2023-08-21",
    details: {
      industry: "PropTech",
      category: "Construction",
      location: "Lagos, Nigeria",
      cohort: "ASIP 2025",
      country_code: "NG",
      sector: "PropTech",
      founder_names: ["Tunde Adebayo", "Funke Adeyemi"],
      public_outcome: null,
      featured: false,
      founding_year: 2023,
      problem: "Developers bid with stale material prices and overrun budgets.",
      solution: "Live cost indices + tender templates.",
      target_market: "Mid-rise residential developers",
      business_model: "Subscription + report packs",
    },
  },
];

const SEED_COHORTS = [
  {
    year: 2021,
    public_label: "ASIP 2021",
    programme_dates_start: "2021-03-01",
    programme_dates_end: "2021-11-30",
    programme_status: "closed",
    summary:
      "Early ASIP chapter focused on product discovery workshops and partner office hours for first-time founders.",
    publish_status: "published",
    partnerNames: ["ASIP", "AWS", "Miro"],
    startupSlugs: ["seed-waterops", "seed-fleetfix"],
  },
  {
    year: 2022,
    public_label: "ASIP 2022",
    programme_dates_start: "2022-02-15",
    programme_dates_end: "2022-12-15",
    programme_status: "closed",
    summary:
      "Second chapter expanded commercialisation clinics and investor dialogue for growth-stage teams.",
    publish_status: "published",
    partnerNames: ["ASIP", "Google Cloud", "FMO Ventures", "Startupbootcamp AfriTech"],
    startupSlugs: ["seed-farmtrace", "seed-solargrid-ops", "seed-insurebaobab"],
  },
  {
    year: 2023,
    public_label: "ASIP 2023",
    programme_dates_start: "2023-03-01",
    programme_dates_end: "2023-12-01",
    programme_status: "closed",
    summary:
      "Cohort centred on corridor expansion, B2B sales playbooks, and Telecel network introductions.",
    publish_status: "published",
    partnerNames: ["ASIP", "AWS", "HubSpot", "Freshworks", "Accelerator²"],
    startupSlugs: [
      "seed-paystack-lite",
      "seed-mediroute",
      "seed-cargoos",
      "seed-marketmesh",
    ],
  },
  {
    year: 2024,
    public_label: "ASIP 2024",
    programme_dates_start: "2024-04-01",
    programme_dates_end: "2024-12-20",
    programme_status: "closed",
    summary:
      "Founders shipped customer pilots, hired commercial leads, and opened regional distribution partnerships.",
    publish_status: "published",
    partnerNames: ["ASIP", "Cloudworx", "DHub", "Firstbase", "DER"],
    startupSlugs: [
      "seed-edusprint",
      "seed-retailpulse",
      "seed-talentbridge",
      "seed-climateledger",
    ],
  },
  {
    year: 2025,
    public_label: "ASIP 2025",
    programme_dates_start: "2025-05-01",
    programme_dates_end: "2025-12-31",
    programme_status: "hold",
    summary:
      "Next chapter is being scoped. Register interest to hear when applications open.",
    publish_status: "draft",
    partnerNames: ["ASIP", "AWS", "Google Cloud"],
    startupSlugs: ["seed-healthkit-lab", "seed-buildcost"],
  },
];

const SEED_EVIDENCE = [
  {
    key: "cohort-completions-2024",
    primary_source:
      "ASIP programme ops export: cohort completion and demo-day attendance (2024).",
    source_file_url: "https://www.untitledui.com/marketing/conversation.webp",
    measurement_period_start: "2024-01-01",
    measurement_period_end: "2024-12-31",
    status: "verified",
    last_verified_date: "2025-01-20",
    permission: "public",
    review_date: "2025-01-25",
  },
  {
    key: "jobs-created-survey-2023",
    primary_source:
      "Founder annual survey: full-time roles created by active portfolio companies (2023).",
    measurement_period_start: "2023-01-01",
    measurement_period_end: "2023-12-31",
    status: "verified",
    last_verified_date: "2024-02-10",
    permission: "public",
    review_date: "2024-02-15",
  },
  {
    key: "women-founded-share-2024",
    primary_source:
      "Application and selection CRM: women-founded team share across ASIP 2024.",
    measurement_period_start: "2024-01-01",
    measurement_period_end: "2024-12-31",
    status: "verified",
    last_verified_date: "2025-01-08",
    permission: "public",
    review_date: "2025-01-12",
  },
  {
    key: "pilot-revenue-2024",
    primary_source:
      "Partner pilot tracker: billed commercial pilots closed by ASIP teams in 2024.",
    measurement_period_start: "2024-01-01",
    measurement_period_end: "2024-12-31",
    status: "verified",
    last_verified_date: "2025-02-01",
    permission: "partner_approval_required",
    review_date: "2025-02-05",
  },
  {
    key: "countries-active-2025",
    primary_source:
      "Portfolio CRM: countries with at least one active customer or pilot (H1 2025).",
    measurement_period_start: "2025-01-01",
    measurement_period_end: "2025-06-30",
    status: "verified",
    last_verified_date: "2025-07-10",
    permission: "public",
    review_date: "2025-07-15",
  },
  {
    key: "mentor-hours-2023",
    primary_source:
      "Mentor scheduling export: delivered mentoring hours across ASIP 2023.",
    measurement_period_start: "2023-03-01",
    measurement_period_end: "2023-12-01",
    status: "pending",
    last_verified_date: "2024-01-05",
    permission: "internal_only",
    review_date: "2024-01-20",
  },
  {
    key: "capital-introductions-2022",
    primary_source:
      "Investment-readiness log: warm introductions to funds after ASIP 2022 demo day.",
    measurement_period_start: "2022-10-01",
    measurement_period_end: "2023-03-31",
    status: "outdated",
    last_verified_date: "2023-04-01",
    permission: "public",
    review_date: "2023-04-10",
  },
  {
    key: "alumni-retention-2021",
    primary_source:
      "Alumni check-in: companies still operating 24 months after ASIP 2021.",
    measurement_period_start: "2021-01-01",
    measurement_period_end: "2023-12-31",
    status: "verified",
    last_verified_date: "2024-01-15",
    permission: "public",
    review_date: "2024-01-20",
  },
  {
    key: "sector-fintech-share",
    primary_source:
      "Portfolio taxonomy report: fintech share of active startups (2024).",
    measurement_period_start: "2024-01-01",
    measurement_period_end: "2024-12-31",
    status: "verified",
    last_verified_date: "2025-01-05",
    permission: "public",
    review_date: "2025-01-08",
  },
  {
    key: "customer-pilots-open",
    primary_source:
      "Commercialisation board: open enterprise pilots across current portfolio.",
    measurement_period_start: "2025-01-01",
    measurement_period_end: "2025-06-30",
    status: "pending",
    last_verified_date: "2025-06-01",
    permission: "internal_only",
    review_date: "2025-06-15",
  },
  {
    key: "disputed-jobs-claim",
    primary_source:
      "External press claim of jobs created — under review against survey methodology.",
    measurement_period_start: "2022-01-01",
    measurement_period_end: "2024-12-31",
    status: "disputed",
    last_verified_date: "2025-03-01",
    permission: "legal_review_required",
    review_date: "2025-03-15",
  },
  {
    key: "internal-pipeline-only",
    primary_source:
      "CRM pipeline snapshot for internal ops — not cleared for public pages.",
    measurement_period_start: "2025-01-01",
    measurement_period_end: "2025-03-31",
    status: "not_for_publication",
    last_verified_date: "2025-04-01",
    permission: "internal_only",
    review_date: "2025-04-05",
  },
];

const SEED_METRICS = [
  {
    claim_label: "Founders completing the 2024 chapter",
    value: "42",
    unit: "founders",
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    geography: "Africa",
    impact_lens: "pipeline",
    display_locations: ["homepage_module_02", "impact_page"],
    evidenceKey: "cohort-completions-2024",
    publish_status: "verified",
  },
  {
    claim_label: "Full-time roles created by portfolio companies",
    value: "1,240",
    unit: "roles",
    period_start: "2023-01-01",
    period_end: "2023-12-31",
    geography: "Africa",
    impact_lens: "jobs_capability",
    display_locations: ["impact_page"],
    evidenceKey: "jobs-created-survey-2023",
    publish_status: "verified",
  },
  {
    claim_label: "Women-founded teams in ASIP 2024",
    value: "38%",
    unit: null,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    geography: "Africa",
    impact_lens: "inclusion",
    display_locations: ["homepage_module_02", "impact_page"],
    evidenceKey: "women-founded-share-2024",
    publish_status: "verified",
  },
  {
    claim_label: "Commercial pilots billed in 2024",
    value: "67",
    unit: "pilots",
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    geography: "Africa",
    impact_lens: "commercialisation",
    display_locations: ["impact_page"],
    evidenceKey: "pilot-revenue-2024",
    publish_status: "verified",
  },
  {
    claim_label: "Countries with active customers or pilots",
    value: "18",
    unit: "countries",
    period_start: "2025-01-01",
    period_end: "2025-06-30",
    geography: "Africa",
    impact_lens: "business_growth",
    display_locations: ["homepage_module_02"],
    evidenceKey: "countries-active-2025",
    publish_status: "verified",
  },
  {
    claim_label: "Mentor hours delivered in 2023",
    value: "1,850",
    unit: "hours",
    period_start: "2023-03-01",
    period_end: "2023-12-01",
    geography: "Africa",
    impact_lens: "jobs_capability",
    display_locations: ["impact_page"],
    evidenceKey: "mentor-hours-2023",
    publish_status: "pending",
  },
  {
    claim_label: "Fund introductions after ASIP 2022",
    value: "54",
    unit: "intros",
    period_start: "2022-10-01",
    period_end: "2023-03-31",
    geography: "Africa",
    impact_lens: "commercialisation",
    display_locations: [],
    evidenceKey: "capital-introductions-2022",
    publish_status: "outdated",
  },
  {
    claim_label: "ASIP 2021 alumni still operating at 24 months",
    value: "81%",
    unit: null,
    period_start: "2021-01-01",
    period_end: "2023-12-31",
    geography: "Africa",
    impact_lens: "business_growth",
    display_locations: ["impact_page"],
    evidenceKey: "alumni-retention-2021",
    publish_status: "verified",
  },
  {
    claim_label: "Fintech share of active portfolio",
    value: "29%",
    unit: null,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    geography: "Africa",
    impact_lens: "sector_outcomes",
    display_locations: ["impact_page"],
    evidenceKey: "sector-fintech-share",
    publish_status: "verified",
  },
  {
    claim_label: "Open enterprise pilots (H1 2025)",
    value: "31",
    unit: "pilots",
    period_start: "2025-01-01",
    period_end: "2025-06-30",
    geography: "Africa",
    impact_lens: "commercialisation",
    display_locations: [],
    evidenceKey: "customer-pilots-open",
    publish_status: "pending",
  },
  {
    claim_label: "Repeat buyers after first pilot",
    value: "44%",
    unit: null,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    geography: "West Africa",
    impact_lens: "business_growth",
    display_locations: ["impact_page"],
    evidenceKey: "pilot-revenue-2024",
    publish_status: "verified",
  },
  {
    claim_label: "Applications reviewed for ASIP 2024",
    value: "890",
    unit: "applications",
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    geography: "Africa",
    impact_lens: "pipeline",
    display_locations: ["homepage_module_02"],
    evidenceKey: "cohort-completions-2024",
    publish_status: "verified",
  },
  {
    claim_label: "Disputed external jobs figure (do not publish)",
    value: "10,000+",
    unit: "jobs",
    period_start: "2022-01-01",
    period_end: "2024-12-31",
    geography: "Africa",
    impact_lens: "jobs_capability",
    display_locations: [],
    evidenceKey: "disputed-jobs-claim",
    publish_status: "disputed",
  },
  {
    claim_label: "Internal CRM pipeline value",
    value: "$12M",
    unit: null,
    period_start: "2025-01-01",
    period_end: "2025-03-31",
    geography: "Africa",
    impact_lens: "pipeline",
    display_locations: [],
    evidenceKey: "internal-pipeline-only",
    publish_status: "not_for_publication",
  },
  {
    claim_label: "HealthTech founders with live clinic pilots",
    value: "11",
    unit: "teams",
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    geography: "East & West Africa",
    impact_lens: "sector_outcomes",
    display_locations: ["impact_page"],
    evidenceKey: "pilot-revenue-2024",
    publish_status: "verified",
  },
];

const FOUNDER_STORY_SLUGS = [
  "seed-paystack-lite",
  "seed-farmtrace",
  "seed-mediroute",
  "seed-solargrid-ops",
  "seed-edusprint",
  "seed-cargoos",
  "seed-retailpulse",
  "seed-insurebaobab",
  "seed-waterops",
  "seed-talentbridge",
];

const SEED_EVENTS = [
  {
    name: "ASIP Demo Day 2023",
    event_date: "2023-11-18",
    location: "Accra, Ghana",
    format: "hybrid",
    speakers: ["Ada Okonkwo", "Yaw Owusu", "Programme lead"],
    assets: [COVER_URLS[0], COVER_URLS[2]],
    outcomes:
      "Twelve teams pitched corridor expansion plans to partners and operators.",
    publish_status: "published",
    startupSlugs: [
      "seed-paystack-lite",
      "seed-mediroute",
      "seed-cargoos",
      "seed-marketmesh",
    ],
  },
  {
    name: "ASIP Commercialisation Clinic",
    event_date: "2024-06-12",
    location: "Virtual",
    format: "virtual",
    speakers: ["Thandi Ndlovu", "Partner success lead"],
    assets: [COVER_URLS[1]],
    outcomes: "Founders left with scored pilot proposals for named buyers.",
    publish_status: "published",
    startupSlugs: ["seed-edusprint", "seed-retailpulse", "seed-climateledger"],
  },
  {
    name: "West Africa Corridor Meetup",
    event_date: "2024-09-05",
    location: "Lagos, Nigeria",
    format: "in_person",
    speakers: ["Fatou Diop", "Logistics operator panel"],
    assets: [COVER_URLS[3]],
    outcomes: "Mapped three shared documentation bottlenecks with operators.",
    publish_status: "published",
    startupSlugs: ["seed-cargoos", "seed-paystack-lite"],
  },
  {
    name: "ASIP Investor Dialogue 2022",
    event_date: "2022-11-22",
    location: "Nairobi, Kenya",
    format: "hybrid",
    speakers: ["Wanjiru Kamau", "Jean Uwimana"],
    assets: [COVER_URLS[4]],
    outcomes: "Teams ran diligence Q&A with early-stage funds.",
    publish_status: "published",
    startupSlugs: ["seed-farmtrace", "seed-solargrid-ops", "seed-insurebaobab"],
  },
  {
    name: "Founder Ops Workshop",
    event_date: "2025-02-14",
    location: "Cape Town, South Africa",
    format: "in_person",
    speakers: ["Nia Okello"],
    assets: [],
    outcomes: "Hiring playbooks for fractional leads and first sales hires.",
    publish_status: "published",
    startupSlugs: ["seed-talentbridge", "seed-edusprint"],
  },
  {
    name: "Climate MRV Roundtable",
    event_date: "2025-04-03",
    location: "Accra, Ghana",
    format: "hybrid",
    speakers: ["Kojo Asante", "Verifier guest"],
    assets: [COVER_URLS[5]],
    outcomes: "Agreed data-room checklist for upcoming verification cycles.",
    publish_status: "draft",
    startupSlugs: ["seed-climateledger", "seed-waterops"],
  },
  {
    name: "Health Logistics Lab Day",
    event_date: "2023-07-08",
    location: "Accra, Ghana",
    format: "in_person",
    speakers: ["Kwame Mensah", "Ama Boateng"],
    assets: [COVER_URLS[2]],
    outcomes: "Clinic partners reviewed cold-box routing prototypes.",
    publish_status: "published",
    startupSlugs: ["seed-mediroute"],
  },
  {
    name: "ASIP Alumni Circle (draft)",
    event_date: "2025-10-01",
    location: "Virtual",
    format: "virtual",
    speakers: ["Alumni hosts"],
    assets: [],
    outcomes: null,
    publish_status: "draft",
    startupSlugs: ["seed-waterops", "seed-farmtrace", "seed-paystack-lite"],
  },
];

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Rwanda",
  "Senegal",
  "Côte d'Ivoire",
  "Uganda",
  "Ethiopia",
  "Morocco",
];
const SECTORS = [
  "Fintech",
  "HealthTech",
  "AgriTech",
  "EdTech",
  "CleanTech",
  "Logistics",
  "Commerce",
  "InsurTech",
];
const INBOX_STATUSES = ["unread", "reviewed", "archived"];
const ENQUIRY_TYPES = ["founder", "partner", "media", "general"];
const FIRST_NAMES = [
  "Ada",
  "Kwame",
  "Amina",
  "Jean",
  "Thandi",
  "Fatou",
  "Yaw",
  "Grace",
  "Ibrahim",
  "Nia",
  "Kojo",
  "Helen",
];
const LAST_NAMES = [
  "Okonkwo",
  "Mensah",
  "Diallo",
  "Uwimana",
  "Ndlovu",
  "Diop",
  "Owusu",
  "Wambui",
  "Bello",
  "Okello",
  "Asante",
  "Bekele",
];

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function processStartupLogo(input) {
  return sharp(input)
    .rotate()
    .resize({
      width: STARTUP_LOGO_MAX_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

async function uploadStartupLogo(supabase, startupId, sourceUrl) {
  const raw = await downloadImage(sourceUrl);
  const buffer = await processStartupLogo(raw);
  const path = `${startupId}/${randomUUID().slice(0, 10)}.webp`;
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(path, buffer, {
    contentType: "image/webp",
    upsert: false,
    cacheControl: "31536000",
  });
  if (error) throw error;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${LOGO_BUCKET}/${path}`;
}

async function resolveAdminId(supabase) {
  const { data: byEmail, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", SEED_ADMIN_EMAIL)
    .maybeSingle();
  if (profileError) throw profileError;
  if (byEmail?.id) return byEmail.id;

  const { data: users, error: userError } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });
  if (userError) throw userError;
  const seed = users.users.find(
    (user) => user.email?.toLowerCase() === SEED_ADMIN_EMAIL.toLowerCase(),
  );
  if (!seed?.id) {
    throw new Error(
      `Seed admin ${SEED_ADMIN_EMAIL} not found. Run supabase/seed.sql first.`,
    );
  }
  return seed.id;
}

async function resolvePartners(supabase) {
  const { data, error } = await supabase
    .from("partners")
    .select("id, name")
    .in("name", PARTNER_NAMES);
  if (error) throw error;
  const map = new Map((data ?? []).map((row) => [row.name, row.id]));
  for (const name of PARTNER_NAMES) {
    if (!map.has(name)) {
      console.warn(`Partner missing (skip links that need it): ${name}`);
    }
  }
  return map;
}

function storyForStartup(startup) {
  const founder = startup.details.founder_names[0] ?? "Founder";
  const published = startup.status === "active";
  const withQuote = published && startup.slug !== "seed-talentbridge";
  return {
    the_problem:
      startup.details.problem ??
      `${startup.name} started from a concrete market gap that kept customers waiting.`,
    what_they_built:
      startup.details.solution ??
      `${startup.name} shipped a product that buyers could pilot within weeks.`,
    the_asip_connection:
      `Through ASIP, ${startup.name} joined workshops, met operators, and used Telecel network introductions to open doors for pilots — without claiming Telecel created their outcomes.`,
    where_they_are_now:
      startup.details.public_outcome ??
      `${startup.name} is still building product and commercial traction.`,
    founder_quote_text: withQuote
      ? `ASIP helped us test faster with real buyers. The introductions mattered — the execution stayed on us.`
      : null,
    quote_attribution_name: withQuote ? founder : null,
    quote_attribution_title: withQuote ? "Founder & CEO" : null,
    quote_date: withQuote ? "2024-06-01" : null,
    quote_permission_status: withQuote
      ? "granted"
      : published
        ? null
        : "pending",
    publish_status: published ? "published" : "draft",
  };
}

function pick(list, index) {
  return list[index % list.length];
}

function phoneFor(index) {
  const base = 1000000 + (index % 8999999);
  return `+233${String(base).slice(0, 9)}`;
}

async function insertBatches(supabase, table, rows) {
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      if (error.code === "23505") {
        // Unique conflict — insert one-by-one to count skips.
        for (const row of chunk) {
          const { error: oneError } = await supabase.from(table).insert(row);
          if (oneError) {
            if (oneError.code === "23505") skipped += 1;
            else throw oneError;
          } else {
            inserted += 1;
          }
        }
        continue;
      }
      throw error;
    }
    inserted += chunk.length;
  }
  return { inserted, skipped };
}

/** Fast skip when a prior seed already filled this inbox table. */
async function countSeedEmails(supabase, table, emailPrefix) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .ilike("email", `${emailPrefix}%`);
  if (error) throw error;
  return count ?? 0;
}

async function seedStartups(supabase) {
  /** @type {Map<string, string>} */
  const slugToId = new Map();
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < SEED_STARTUPS.length; i += 1) {
    const item = SEED_STARTUPS[i];
    process.stdout.write(`Startup ${item.slug}… `);

    const { data: existing, error: existingError } = await supabase
      .from("startups")
      .select("id, logo_url")
      .eq("slug", item.slug)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      slugToId.set(item.slug, existing.id);
      if (!existing.logo_url) {
        try {
          const logoUrl = await uploadStartupLogo(
            supabase,
            existing.id,
            pick(LOGO_URLS, i),
          );
          const { error: logoError } = await supabase
            .from("startups")
            .update({ logo_url: logoUrl })
            .eq("id", existing.id);
          if (logoError) throw logoError;
          console.log("exists (logo repaired)");
        } catch (logoErr) {
          console.log(`exists (logo skip: ${logoErr.message})`);
        }
      } else {
        console.log("exists");
      }
      skipped += 1;
      continue;
    }

    const startupId = randomUUID();
    let logoUrl = null;
    try {
      logoUrl = await uploadStartupLogo(supabase, startupId, pick(LOGO_URLS, i));
    } catch (logoErr) {
      console.warn(`logo upload failed (${logoErr.message}), continuing`);
    }

    const { error: coreError } = await supabase.from("startups").insert({
      id: startupId,
      name: item.name,
      slug: item.slug,
      description: item.description,
      status: item.status,
      founded_at: item.founded_at,
      logo_url: logoUrl,
    });
    if (coreError) throw coreError;

    const d = item.details;
    const { error: detailsError } = await supabase.from("startup_details").insert({
      startup_id: startupId,
      website_url: d.website_url ?? null,
      industry: d.industry ?? null,
      category: d.category ?? null,
      location: d.location ?? null,
      founding_year: d.founding_year ?? null,
      team: null,
      size: null,
      problem: d.problem ?? null,
      solution: d.solution ?? null,
      target_market: d.target_market ?? null,
      business_model: d.business_model ?? null,
      funding_goal: null,
      amount_raised: null,
      cohort: d.cohort ?? null,
      country_code: d.country_code ?? null,
      sector: d.sector ?? null,
      founder_names: d.founder_names ?? [],
      cover_image_url: pick(COVER_URLS, i),
      public_outcome: d.public_outcome ?? null,
      featured: Boolean(d.featured),
      image_focal_x: 50,
      image_focal_y: 50,
    });
    if (detailsError) throw detailsError;

    slugToId.set(item.slug, startupId);
    created += 1;
    console.log("ok");
  }

  return { slugToId, created, skipped };
}

async function seedEvidenceAndMetrics(supabase, ownerId) {
  /** @type {Map<string, string>} */
  const keyToId = new Map();
  let evidenceCreated = 0;
  let evidenceSkipped = 0;

  for (const item of SEED_EVIDENCE) {
    const primarySource = `${SEED_EVIDENCE_PREFIX}${item.key}: ${item.primary_source}`;
    process.stdout.write(`Evidence ${item.key}… `);

    const { data: existing, error: existingError } = await supabase
      .from("evidence_records")
      .select("id")
      .ilike("primary_source", `${SEED_EVIDENCE_PREFIX}${item.key}:%`)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      keyToId.set(item.key, existing.id);
      evidenceSkipped += 1;
      console.log("exists");
      continue;
    }

    const { data, error } = await supabase
      .from("evidence_records")
      .insert({
        primary_source: primarySource,
        source_file_url: item.source_file_url ?? null,
        measurement_period_start: item.measurement_period_start,
        measurement_period_end: item.measurement_period_end,
        owner_id: ownerId,
        status: item.status,
        last_verified_date: item.last_verified_date,
        permission: item.permission,
        review_date: item.review_date,
      })
      .select("id")
      .single();
    if (error) throw error;
    keyToId.set(item.key, data.id);
    evidenceCreated += 1;
    console.log("ok");
  }

  let metricsCreated = 0;
  let metricsSkipped = 0;
  for (const metric of SEED_METRICS) {
    const evidenceId = keyToId.get(metric.evidenceKey);
    if (!evidenceId) {
      console.warn(`Metric skip — missing evidence ${metric.evidenceKey}`);
      continue;
    }
    process.stdout.write(`Metric ${metric.claim_label.slice(0, 40)}… `);

    const { data: existing, error: existingError } = await supabase
      .from("impact_metrics")
      .select("id")
      .eq("claim_label", metric.claim_label)
      .eq("evidence_id", evidenceId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      metricsSkipped += 1;
      console.log("exists");
      continue;
    }

    const { error } = await supabase.from("impact_metrics").insert({
      claim_label: metric.claim_label,
      value: metric.value,
      unit: metric.unit,
      period_start: metric.period_start,
      period_end: metric.period_end,
      geography: metric.geography,
      impact_lens: metric.impact_lens,
      display_locations: metric.display_locations ?? [],
      evidence_id: evidenceId,
      publish_status: metric.publish_status,
    });
    if (error) throw error;
    metricsCreated += 1;
    console.log("ok");
  }

  return { evidenceCreated, evidenceSkipped, metricsCreated, metricsSkipped };
}

async function seedCohorts(supabase, partnerMap, slugToId) {
  let created = 0;
  let skipped = 0;

  for (const cohort of SEED_COHORTS) {
    process.stdout.write(`Cohort ${cohort.year} ${cohort.public_label}… `);

    const { data: existing, error: existingError } = await supabase
      .from("cohorts")
      .select("id")
      .eq("year", cohort.year)
      .eq("public_label", cohort.public_label)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      skipped += 1;
      console.log("exists");
      continue;
    }

    const cohortId = randomUUID();
    const { error } = await supabase.from("cohorts").insert({
      id: cohortId,
      year: cohort.year,
      public_label: cohort.public_label,
      programme_dates_start: cohort.programme_dates_start,
      programme_dates_end: cohort.programme_dates_end,
      programme_status: cohort.programme_status,
      summary: cohort.summary,
      media_url: pick(COVER_URLS, cohort.year),
      publish_status: cohort.publish_status,
    });
    if (error) throw error;

    const partnerRows = cohort.partnerNames
      .map((name) => partnerMap.get(name))
      .filter(Boolean)
      .map((partnerId) => ({ cohort_id: cohortId, partner_id: partnerId }));
    if (partnerRows.length) {
      const { error: partnerError } = await supabase
        .from("cohort_partners")
        .insert(partnerRows);
      if (partnerError) throw partnerError;
    }

    const startupRows = cohort.startupSlugs
      .map((slug) => slugToId.get(slug))
      .filter(Boolean)
      .map((startupId) => ({ cohort_id: cohortId, startup_id: startupId }));
    if (startupRows.length) {
      const { error: startupError } = await supabase
        .from("cohort_startups")
        .insert(startupRows);
      if (startupError) throw startupError;
    }

    created += 1;
    console.log("ok");
  }

  return { created, skipped };
}

async function seedFounderStories(supabase, slugToId) {
  let created = 0;
  let skipped = 0;
  const bySlug = new Map(SEED_STARTUPS.map((s) => [s.slug, s]));

  for (const slug of FOUNDER_STORY_SLUGS) {
    const startupId = slugToId.get(slug);
    const startup = bySlug.get(slug);
    if (!startupId || !startup) {
      console.warn(`Founder story skip — missing startup ${slug}`);
      continue;
    }
    process.stdout.write(`Founder story ${slug}… `);

    const { data: existing, error: existingError } = await supabase
      .from("founder_stories")
      .select("id")
      .eq("startup_id", startupId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      skipped += 1;
      console.log("exists");
      continue;
    }

    const story = storyForStartup(startup);
    const { error } = await supabase.from("founder_stories").insert({
      startup_id: startupId,
      ...story,
    });
    if (error) throw error;
    created += 1;
    console.log("ok");
  }

  return { created, skipped };
}

async function seedEvents(supabase, slugToId) {
  let created = 0;
  let skipped = 0;

  for (const event of SEED_EVENTS) {
    process.stdout.write(`Event ${event.name}… `);

    const { data: existing, error: existingError } = await supabase
      .from("events")
      .select("id")
      .eq("name", event.name)
      .eq("event_date", event.event_date)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      skipped += 1;
      console.log("exists");
      continue;
    }

    const eventId = randomUUID();
    const { error } = await supabase.from("events").insert({
      id: eventId,
      name: event.name,
      event_date: event.event_date,
      location: event.location,
      format: event.format,
      speakers: event.speakers,
      assets: event.assets,
      outcomes: event.outcomes,
      publish_status: event.publish_status,
    });
    if (error) throw error;

    const links = event.startupSlugs
      .map((slug) => slugToId.get(slug))
      .filter(Boolean)
      .map((startupId) => ({ event_id: eventId, startup_id: startupId }));
    if (links.length) {
      const { error: linkError } = await supabase
        .from("event_startups")
        .insert(links);
      if (linkError) throw linkError;
    }

    created += 1;
    console.log("ok");
  }

  return { created, skipped };
}

function buildApplications() {
  return Array.from({ length: INBOX_COUNT }, (_, i) => {
    const n = i + 1;
    const first = pick(FIRST_NAMES, n);
    const last = pick(LAST_NAMES, n * 3);
    return {
      full_name: `${first} ${last}`,
      founder_role: n % 5 === 0 ? "Co-founder & CTO" : "Founder & CEO",
      email: `seed.app.${n}@example.com`,
      phone: phoneFor(n),
      country: pick(COUNTRIES, n),
      linkedin: n % 4 === 0 ? `https://www.linkedin.com/in/seed-app-${n}` : null,
      company_name: `Seed Apply Co ${n}`,
      website: n % 3 === 0 ? `https://example.com/apply-${n}` : null,
      company_country: pick(COUNTRIES, n + 2),
      sector: pick(SECTORS, n),
      problem_product:
        `We are building a ${pick(SECTORS, n).toLowerCase()} product that helps customers cut operational delay. ` +
        `This application describes the problem, current product, and why ASIP is a fit for the next stage.`,
      traction:
        `We have early customers in ${pick(COUNTRIES, n)} and are measuring weekly active usage and paid pilots.`,
      programme_fit:
        `We want ASIP workshops, operator introductions, and commercialisation support to expand into a second market.`,
      consent: true,
      comms_opt_in: n % 2 === 0,
      inbox_status: pick(INBOX_STATUSES, n),
    };
  });
}

function buildRegistrations() {
  return Array.from({ length: INBOX_COUNT }, (_, i) => {
    const n = i + 1;
    const first = pick(FIRST_NAMES, n + 1);
    const last = pick(LAST_NAMES, n * 5);
    return {
      full_name: `${first} ${last}`,
      founder_role: n % 3 === 0 ? "Founder" : "Co-founder",
      email: `seed.reg.${n}@example.com`,
      phone: phoneFor(n + 50),
      country: pick(COUNTRIES, n + 1),
      linkedin: n % 5 === 0 ? `https://www.linkedin.com/in/seed-reg-${n}` : null,
      company_name: `Seed Interest Co ${n}`,
      website: n % 4 === 0 ? `https://example.com/reg-${n}` : null,
      company_country: pick(COUNTRIES, n + 3),
      sector: pick(SECTORS, n + 1),
      pitch:
        n % 2 === 0
          ? `Registering interest for the next ASIP chapter. Building in ${pick(SECTORS, n)} with early traction.`
          : null,
      consent: true,
      comms_opt_in: n % 3 !== 0,
      inbox_status: pick(INBOX_STATUSES, n + 1),
    };
  });
}

function buildContactMessages() {
  return Array.from({ length: INBOX_COUNT }, (_, i) => {
    const n = i + 1;
    const first = pick(FIRST_NAMES, n + 2);
    const last = pick(LAST_NAMES, n * 7);
    const enquiry = pick(ENQUIRY_TYPES, n);
    return {
      full_name: `${first} ${last}`,
      email: `seed.contact.${n}@example.com`,
      phone: phoneFor(n + 100),
      subject: `${enquiry} enquiry #${n} about ASIP`,
      message:
        `Hello ASIP team — this is a seeded ${enquiry} message (#${n}) to exercise the contact inbox filters, ` +
        `search, and triage flows. Please ignore in production.`,
      enquiry_type: enquiry,
      inbox_status: pick(INBOX_STATUSES, n + 2),
    };
  });
}

async function seedInbox(supabase) {
  console.log("Seeding applications…");
  const existingApps = await countSeedEmails(
    supabase,
    "applications",
    "seed.app.",
  );
  let apps;
  if (existingApps >= INBOX_COUNT) {
    apps = { inserted: 0, skipped: INBOX_COUNT };
    console.log(`  already seeded (${existingApps}), skipped`);
  } else {
    apps = await insertBatches(supabase, "applications", buildApplications());
    console.log(`  inserted ${apps.inserted}, skipped ${apps.skipped}`);
  }

  console.log("Seeding interest_registrations…");
  const existingRegs = await countSeedEmails(
    supabase,
    "interest_registrations",
    "seed.reg.",
  );
  let regs;
  if (existingRegs >= INBOX_COUNT) {
    regs = { inserted: 0, skipped: INBOX_COUNT };
    console.log(`  already seeded (${existingRegs}), skipped`);
  } else {
    regs = await insertBatches(
      supabase,
      "interest_registrations",
      buildRegistrations(),
    );
    console.log(`  inserted ${regs.inserted}, skipped ${regs.skipped}`);
  }

  console.log("Seeding contact_messages…");
  // No unique (email, subject) — skip entirely if seed emails already exist.
  const existingContacts = await countSeedEmails(
    supabase,
    "contact_messages",
    "seed.contact.",
  );
  let contacts;
  if (existingContacts >= INBOX_COUNT) {
    contacts = { inserted: 0, skipped: INBOX_COUNT };
    console.log(`  already seeded (${existingContacts}), skipped`);
  } else {
    contacts = await insertBatches(
      supabase,
      "contact_messages",
      buildContactMessages(),
    );
    console.log(`  inserted ${contacts.inserted}, skipped ${contacts.skipped}`);
  }

  return { apps, regs, contacts };
}

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

  console.log("Resolving admin + partners…");
  const ownerId = await resolveAdminId(supabase);
  const partnerMap = await resolvePartners(supabase);
  console.log(`  admin=${ownerId}`);
  console.log(`  partners resolved=${partnerMap.size}`);

  console.log("\n=== Startups ===");
  const startups = await seedStartups(supabase);

  console.log("\n=== Evidence + impact metrics ===");
  const evidence = await seedEvidenceAndMetrics(supabase, ownerId);

  console.log("\n=== Cohorts ===");
  const cohorts = await seedCohorts(supabase, partnerMap, startups.slugToId);

  console.log("\n=== Founder stories ===");
  const stories = await seedFounderStories(supabase, startups.slugToId);

  console.log("\n=== Events ===");
  const events = await seedEvents(supabase, startups.slugToId);

  console.log("\n=== Inbox ===");
  const inbox = await seedInbox(supabase);

  console.log("\nDone.");
  console.log(
    JSON.stringify(
      {
        startups: { created: startups.created, skipped: startups.skipped },
        evidence: {
          created: evidence.evidenceCreated,
          skipped: evidence.evidenceSkipped,
        },
        metrics: {
          created: evidence.metricsCreated,
          skipped: evidence.metricsSkipped,
        },
        cohorts,
        stories,
        events,
        inbox,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
