## Register / Apply Logic

### Overview

This system uses a shared page template for two intake URLs, controlled by a CMS toggle: `site_settings.open_applications` (`true` = open, `false` = closed).

**Only one path is live at a time:**

- **Closed (default at launch):** Register Interest is accessible and accepts leads; `/apply` redirects to `/register-interest` and rejects application submits
- **Open (when confirmed):** Apply is accessible and accepts applications; `/register-interest` redirects to `/apply` and rejects lead submits

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
2. **Navbar / footer CTA:** “Register Interest” vs “Apply to ASIP”
3. **SEO / sitemap:** only the live intake URL is indexable and listed
4. **Mutual gate:** the inactive URL redirects to the live one; its Server Action rejects submits

Form fields and submission tables are driven by **page URL** (slug) when that path is live:

- `/register-interest` → Leads form → `interest_registrations` (only when closed)
- `/apply` → Applications form → `applications` (only when open)

---

### Who Controls the Toggle?

- **Primary:** Alix
- **Secondary:** Nominated Telecel CMS admins
- **_Note:_** The developer (Mahdi) never flips it without written Telecel instruction.
- **No scheduled/automatic switch:** This is always a manual toggle, not based on date/timer.

---

### Navigation decision (resolved)

**Mutual exclusivity.** The CMS toggle picks which intake URL is live. The other redirects and rejects submits.
