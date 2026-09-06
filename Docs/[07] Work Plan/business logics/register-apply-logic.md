## Register / Apply Logic

### Overview

This system uses a shared page template for two always-live URLs, controlled by a CMS toggle: `site_settings.open_applications` (`true` = open, `false` = closed).

- **Closed (default at launch):** Navbar CTA + status banner promote Register Interest
- **Open (later, when confirmed):** Navbar CTA + status banner promote Apply; `/apply` becomes indexable

Both `/register-interest/` and `/apply/` stay reachable at all times. Changing the toggle does **not** redirect between URLs.

---

### Data Model

**Two separate content types:**

- **Leads** (`interest_registrations`): Every "Register Interest" submission
- **Applications** (`applications`): Every "Apply" submission

> **Important:** There is **no automatic conversion** from Leads to Applications. If someone registers interest while applications are closed, they are _not_ automatically added to Applications when Apply opens. Interested leads are manually invited to submit an Application. Leads are for notifications; Applications are the official intake pipeline.

---

### Captured Fields

#### Shared Fields (in both forms)

- Founder name
- Founder role
- Email
- Phone/WhatsApp
- Country
- LinkedIn (optional)
- Startup name
- Website (optional)
- Company country
- Sector
- Privacy consent
- Comms opt-in

#### Apply-Only (deeper qualifying information)

- Problem & product (detailed)
- Traction (users, revenue, funding, pilots)
- Programme fit (growth needs, why ASIP now)

_Register Interest_ is a lightweight lead capture. _Apply_ includes all lead data plus these additional substantive sections.

---

### UI & Logic Behavior: What Changes When Toggled

Changing `open_applications` updates:

1. **Status banner:** closed vs open copy and CTA destination
2. **Navbar CTA:** “Register Interest” vs “Apply to ASIP”
3. **Apply SEO:** `/apply` is `noindex` + sitemap-excluded when closed; indexable when open

Form fields and submission tables are driven by **page URL** (slug), not the toggle:

- `/register-interest` → Leads form → `interest_registrations`
- `/apply` → Applications form → `applications`

---

### Who Controls the Toggle?

- **Primary:** Alix
- **Secondary:** Nominated Telecel CMS admins
- **_Note:_** The developer (Mahdi) never flips it without written Telecel instruction.
- **No scheduled/automatic switch:** This is always a manual toggle, not based on date/timer.

---

### Navigation decision (resolved)

**Both `/register-interest/` and `/apply/` coexist as separate live pages.** The CMS toggle controls CTA, status banner, and Apply SEO — not URL exclusivity.
