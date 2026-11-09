# ASIP website revisions: summary of changes (2 November 2026)

This covers the client's revision list: copy, terminology, American English, French, the header logo, and the landing page pathways (Investor | Startup).

## Done in this round

### General
- **Header logo:** replaced the "Powered by Startupbootcamp AfriTech" lockup in the top-left header with the new Africa Startup Initiative, a Telecel Group Program logo (`public/ASIP_LOGO_MARK.png`). Startupbootcamp is still named in the historical Cohort 1 content, where it ran the accelerator.
- **American English:** converted British spellings site-wide in English copy, form messages, admin panel labels and CMS seed content. French copy was left alone, because "programme", "organisation" and "centre" are correct in French. The full list is below.
- **Program:** "Programme" is now "Program" everywhere in English copy, and "Telecel Group Programme" is now "Telecel Group Program".
- **Em dashes (—):** removed from all web text in English and French (18 lines in public and admin copy, plus seed content). Most became commas; the year and cohort label separator on the Program page became a colon.
- **Founder(s):** the site already uses "founder(s)" consistently. No "entrepreneur" or "builder" wording remains in English or French ("Backing the builders…" was replaced by the new About headline).
- **SBC AfriTech:** the two founder stories that credited "SBC AfriTech" now credit ASIP. No system messages, forms, notifications or chatbot copy mentioned SBC AfriTech.

### Specific copy (English, with French)
| Where | New English | New French |
|---|---|---|
| About headline | Supporting the founders who are shaping Africa's next chapter. | Soutenir les fondateurs qui façonnent le prochain chapitre de l'Afrique. |
| Program introduction | ASIP is a Telecel Group Program supporting African founders with knowledge, capital pathways, markets, and relationships that can accelerate their growth. | ASIP est un programme du Groupe Telecel qui soutient les fondateurs africains avec les connaissances, les voies de capital, les marchés et les relations qui peuvent accélérer leur croissance. |
| Our Story headline | Backing founders, building for Africa. | Soutenir les fondateurs, bâtir pour l'Afrique. |
| 2026 cohort (home) | The 2026 chapter supports startups using AI to solve existing business challenges and demonstrate measurable gains in revenue, cost efficiency, speed, or market reach. | Le chapitre 2026 soutient des startups qui utilisent l'IA pour résoudre des défis existants des entreprises et démontrer des gains mesurables en revenus, en efficacité des coûts, en rapidité ou en portée de marché. |
| Ecosystem CTA (home) | Explore Partnership Opportunities (was "Partner with ASIP") | Découvrir les opportunités de partenariat |
| Eligibility (Program page) | The client's five criteria: real and meaningful problem; at least one woman in the founding team or executive leadership; proven product in market; existing revenue or commercial traction; a full-time founder. | Same five criteria in French. |

### Landing page
- **Two pathways:** the home hero now asks "I am" and offers two buttons, **Investor** and **Startup** (French: "Je suis", **Investisseur** and **Startup**).
  - **Investor** opens the founders directory, where investors can browse the portfolio.
  - **Startup** opens the application form when applications are open, and the Register Interest form when they are closed.
- **2026 cohort CTAs:** the buttons under the 2026 cohort section are now **Investor | Startup** too, going to the same two places. They replace "Register interest" and "Discuss a partnership".
- **Ecosystem:** "Partner with ASIP" is now **Explore Partnership Opportunities** (see the table above).

### Live CMS content
- Applied the same American English, Program, dash and SBC AfriTech changes to the content in the live database: 4 blog posts (including the "Programme Updates" category, now "Program Updates"), 3 founder stories, 2 partner entries and 10 startup descriptions.
- "UNDP's Funguo Programme" is the official name of a UN program, so it was left as is.
- The BD Waste startup description is at the 2,000-character limit, so to fit its three dash replacements, the already-cut-off ending "World Econom..." was shortened to "World…".

### Follow-up round (3 November)
- **Footer and admin sidebar logo:** both now use a white-text version of the new logo (`public/ASIP_LOGO_MARK_WHITE.png`) made from the client's file. The old Startupbootcamp lockups are no longer used anywhere.
- **Eligibility on the home page:** the 2026 section now shows the five criteria as a "Who should apply" checklist (French: "Qui peut candidater"), as well as on the Program page.
- **Startupbootcamp AfriTech:** removed from the public Partners page. The CMS record stays, so the cohort history is intact, and Cohort 1 copy still credits it as the accelerator.
- **Program page address:** now `/en/program` and `/fr/program`. The old `/programme` addresses redirect permanently.
- **French wording:** the new French lines were reviewed and tightened (Program introduction, 2026 sentence, two eligibility items).

### Follow-up round (6 November)
- **Enquiry → Inquiry:** the Contact page (route labels, legend, hint, page description, form validation message), the Terms and Privacy pages, and the admin contact inbox now use the American "inquiry". Internal names and the `contact_enquiry_type` database enum are unchanged, so no migration is needed.
- **Program in the legal pages:** the last three English "programme" mentions in Terms and Privacy ("programme-fit", "programme-update", "Programme-update") are now "program".
- **French fix:** the Partners page line "programs sectoriels" is back to the correct French "programmes sectoriels".
- **CMS seed content:** the Cohort 3 and Cohort 4 insight articles ("programme" ×3, "digitisation") and three startup descriptions (Agrodata, ParcSmart, Proxalys) now use American spelling. Check the same posts and descriptions in the live CMS and update them in the admin if they still show the British spelling.
- **Old logos deleted:** the unused "Powered by Startupbootcamp AfriTech" lockups (`public/ASIP_LOGO.png`, `public/ASIP_LOGO_WHITE.png`, `public/asip-logo-sidebar.webp`) are removed, so they can no longer be opened by URL.

## Still open
- **Investor form:** the Investor button should open a form for investors. The plan is in `Docs/[07] Work Plan/plan/[2] Investor form and French CMS content.md`. Until that ships, Investor goes to the founders directory.
- **French for CMS content:** blogs, founder stories, startups, partners and cohorts are stored in English only, so the French site shows them in English. The plan is in the same document and needs database changes.
- **Native French review:** still recommended before launch.

## American English corrections

Each row is one line of copy that changed. The British spelling is in **bold** in the "Before" column. Test files are left out.

| British spelling | Times changed |
|---|---|
| programme | 142 |
| programmes | 9 |
| organisation | 8 |
| commercialisation | 8 |
| organisations | 6 |
| whilst | 4 |
| catalogue | 3 |
| commercialise | 3 |
| towards | 2 |
| recognise | 1 |
| localised | 1 |
| unauthorised | 1 |
| authorised | 1 |
| anonymise | 1 |
| enrolled | 1 |
| amongst | 1 |
| specialist | 1 |
| fulfil | 1 |
| labour | 1 |
| enquiry / enquiries (6 November) | 12 |
| programme (6 November) | 6 |
| digitisation / digitising / digitised (6 November) | 3 |
| centred (6 November) | 2 |
| optimises (6 November) | 1 |
| capitalising (6 November) | 1 |
| modernise (6 November) | 1 |
| prioritisation (6 November) | 1 |
| grey (6 November) | 1 |

| Area | File | Before | After |
|---|---|---|---|
| Admin / editor panel | `app/(unlocalized)/(dashboard)/dashboard/page.tsx` | [ROUTES.cohorts]: "**Programme** years and linked founders | [ROUTES.cohorts]: "Program years and linked founders |
| Admin / editor panel | `app/(unlocalized)/(dashboard)/dashboard/page.tsx` | [ROUTES.events]: "**Programme** events **catalogue** | [ROUTES.events]: "Program events catalog |
| Public website | `app/[locale]/(marketing)/alumni/page.tsx` | ASIP is building a stronger alumni experience designed to keep founders engaged beyond the formal **programme**. | ASIP is building a stronger alumni experience designed to keep founders engaged beyond the formal program. |
| Public website | `app/[locale]/(marketing)/faq/page.tsx` | Answers about the ASIP **programme**, applications, and partnerships. | Answers about the ASIP program, applications, and partnerships. |
| Public website | `app/[locale]/(marketing)/insights/page.tsx` | Read founder stories, portfolio news, **programme** updates and practical perspectives from across the ASIP ecosystem. | Read founder stories, portfolio news, program updates and practical perspectives from across the ASIP ecosystem. |
| Public website | `app/[locale]/(marketing)/programme/page.tsx` | ASIP **Programme** | How It Works | ASIP Program | How It Works |
| Public website | `app/[locale]/(marketing)/register-interest/page.tsx` | Register to receive confirmed ASIP application dates, eligibility criteria and **programme** updates when announced. | Register to receive confirmed ASIP application dates, eligibility criteria and program updates when announced. |
| Admin / editor panel | `components/applications/application-dialogs.tsx` | <AdminDetailRow label="**Programme** fit"> | <AdminDetailRow label="Program fit"> |
| Admin / editor panel | `components/applications/application-dialogs.tsx` | **Programme** fit | Program fit |
| Admin / editor panel | `components/cohorts/cohort-editor-form.tsx` | **Programme** | Program |
| Admin / editor panel | `components/cohorts/cohort-editor-form.tsx` | **Programme** start | Program start |
| Admin / editor panel | `components/cohorts/cohort-editor-form.tsx` | **Programme** end | Program end |
| Admin / editor panel | `components/cohorts/cohort-editor-form.tsx` | **Programme** status | Program status |
| Admin / editor panel | `components/cohorts/cohorts-table.tsx` | <TableHead>**Programme**</TableHead> | <TableHead>Program</TableHead> |
| Admin / editor panel | `components/cohorts/cohorts-table.tsx` | emptyDescription="Create the first cohort to manage **programmes** on the site. | emptyDescription="Create the first cohort to manage programs on the site. |
| Admin / editor panel | `components/dashboard/cms-list-stats.tsx` |  key: "open", label: "**Programme** open", icon: LinkIcon, accent: true  |  key: "open", label: "Program open", icon: LinkIcon, accent: true  |
| Public website | `components/layout/site-footer-labels.ts` | **Programme** | Program |
| Public website | `components/layout/site-footer-labels.ts` |  slug: "**programme**", label: "The **programme**"  |  slug: "programme", label: "The program"  |
| Public website | `components/layout/site-nav-labels.test.ts` | expect(enNavLabels().masthead).toBe("A Telecel Group **programme**"); | expect(enNavLabels().masthead).toBe("A Telecel Group program"); |
| Public website | `components/layout/site-nav-labels.test.ts` | **Programme** | Program |
| Public website | `components/layout/site-nav-labels.test.ts` | **Programme** | Program |
| Public website | `components/layout/site-nav-labels.ts` | **Programme** | Program |
| Public website | `components/layout/site-nav-labels.ts` | A Telecel Group **programme** | A Telecel Group program |
| Public website | `components/marketing/about-our-story-section.tsx` | : "ASIP founders and **programme** community | : "ASIP founders and program community |
| Public website | `components/marketing/apply-labels.ts` | I agree that ASIP may store and use this information to contact me about the **programme**. | I agree that ASIP may store and use this information to contact me about the program. |
| Public website | `components/marketing/apply-labels.ts` | Send me **programme** updates by email. | Send me program updates by email. |
| Public website | `components/marketing/apply-labels.ts` | Official **programme** intake. Complete the full profile so the team can review your venture. | Official program intake. Complete the full profile so the team can review your venture. |
| Public website | `components/marketing/apply-labels.ts` | **Programme** fit | Program fit |
| Public website | `components/marketing/apply-labels.ts` | Send me **programme** updates by email. | Send me program updates by email. |
| Public website | `components/marketing/blog-labels.ts` | Founder stories, portfolio news, **programme** updates and practical perspectives from across the ASIP ecosystem. | Founder stories, portfolio news, program updates and practical perspectives from across the ASIP ecosystem. |
| Public website | `components/marketing/blog-labels.ts` |  id: "**programme**-updates", label: "**Programme** Updates"  |  id: "programme-updates", label: "Program Updates"  |
| Public website | `components/marketing/newsletter-signup-labels.ts` | Occasional **programme** and portfolio notes. No spam - unsubscribe any time once delivery is live. | Occasional program and portfolio notes. No spam - unsubscribe any time once delivery is live. |
| Public website | `components/marketing/newsletter-signup-labels.ts` | I agree to ASIP storing my email for **programme** updates. | I agree to ASIP storing my email for program updates. |
| Public website | `components/marketing/partner-labels.ts` | **Organisations** and mentors who worked with ASIP founders in earlier chapters. | Organizations and mentors who worked with ASIP founders in earlier chapters. |
| Public website | `components/marketing/programme-eligibility-section.test.tsx` | it("renders real **programme** photography beside the checklist", () => { | it("renders real program photography beside the checklist", () => { |
| Public website | `components/marketing/programme-hero.test.tsx` | it("renders the **programme** copy and both CTAs", () => { | it("renders the program copy and both CTAs", () => { |
| Public website | `components/marketing/programme-value-section.test.tsx` | it("renders French titles from **programme** copy", () => { | it("renders French titles from program copy", () => { |
| Admin / editor panel | `components/partners/partner-editor-form.tsx` | **Organisation** | Organization |
| Admin / editor panel | `components/partners/partners-filters.tsx` | searchPlaceholder="Filter by name or **organisation**… | searchPlaceholder="Filter by name or organization… |
| Admin / editor panel | `components/partners/partners-table.tsx` | <TableHead>**Organisation**</TableHead> | <TableHead>Organization</TableHead> |
| Public website | `constants/admin-public-reflections.ts` | Name, **organisation**, type, link, and logo (logo only when logo permission allows). | Name, organization, type, link, and logo (logo only when logo permission allows). |
| Public website | `constants/admin-public-reflections.ts` | Published cohorts show as past **programme** chapters and as related labels on insights. | Published cohorts show as past program chapters and as related labels on insights. |
| Public website | `constants/admin-public-reflections.ts` | **Programme** - past chapters | Program - past chapters |
| Public website | `constants/admin-public-reflections.ts` | Year, public label, **programme** status, date window, and summary. | Year, public label, program status, date window, and summary. |
| Public website | `constants/admin-resources.ts` | Manage **programme** years, publish status, and linked partners and founders. | Manage program years, publish status, and linked partners and founders. |
| Public website | `constants/admin-resources.ts` | **Programme** events **catalogue** (speakers, assets, linked startups). No public events marketing page yet. | Program events catalogue (speakers, assets, linked startups). No public events marketing page yet. |
| Public website | `constants/alumni-copy.ts` | ASIP is building a stronger alumni experience designed to keep founders engaged beyond the formal **programme**, creating more opportunities … | ASIP is building a stronger alumni experience designed to keep founders engaged beyond the formal program, creating more opportunities to… |
| Public website | `constants/blog-editor-help.ts` | Optional link to one **programme** cohort. Shown on the public detail page when set. Not required for publishing. | Optional link to one program cohort. Shown on the public detail page when set. Not required for publishing. |
| Public website | `constants/blog-ui.test.ts` | expect(categoryToTabId("**Programme** Updates")).toBe("**programme**-updates"); | expect(categoryToTabId("Program Updates")).toBe("programme-updates"); |
| Public website | `constants/blog-ui.ts` | **programme**-updates": "**Programme** Updates | programme-updates": "Program Updates |
| Public website | `constants/blog-ui.ts` | **programme** updates": "**programme**-updates | program updates": "programme-updates |
| Public website | `constants/cohort-editor-help.ts` | **Programme** | Program |
| Public website | `constants/cohort-editor-help.ts` | Cohort identity, dates, and publish state for public **programme** storytelling. | Cohort identity, dates, and publish state for public program storytelling. |
| Public website | `constants/cohort-editor-help.ts` | **Programme** year used for sorting and labels in CMS and public cohort surfaces. | Program year used for sorting and labels in CMS and public cohort surfaces. |
| Public website | `constants/cohort-editor-help.ts` | **Programme** start / end | Program start / end |
| Public website | `constants/cohort-editor-help.ts` | **Programme** status | Program status |
| Public website | `constants/cohort-editor-help.ts` | Lifecycle of the **programme** itself: closed, open, or hold - separate from publish visibility. | Lifecycle of the program itself: closed, open, or hold - separate from publish visibility. |
| Public website | `constants/cohort-editor-help.ts` | Draft = admin only. Published = eligible for public **programme** past-chapters when the cohort is listed. | Draft = admin only. Published = eligible for public program past-chapters when the cohort is listed. |
| Public website | `constants/dashboard-nav.ts` | **Programme** | Program |
| Public website | `constants/event-editor-help.ts` | Where and how the event runs (admin **catalogue** fields). | Where and how the event runs (admin catalog fields). |
| Public website | `constants/home-copy.ts` | ASIP connects African technology founders to expertise, capital pathways, market access and relationships that help ambitious businesses … | ASIP connects African technology founders to expertise, capital pathways, market access and relationships that help ambitious businesses … |
| Public website | `constants/home-copy.ts` | ASIP founder focused in conversation at a **programme** table | ASIP founder focused in conversation at a program table |
| Public website | `constants/home-copy.ts` | ASIP founders listening during a **programme** pitch session | ASIP founders listening during a program pitch session |
| Public website | `constants/home-copy.ts` | ASIP founders collaborating at a **programme** working table | ASIP founders collaborating at a program working table |
| Public website | `constants/home-copy.ts` | ASIP mentor and founders in conversation at a **programme** event | ASIP mentor and founders in conversation at a program event |
| Public website | `constants/home-copy.ts` | ASIP Cohort 3 founders together at a **programme** event | ASIP Cohort 3 founders together at a program event |
| Public website | `constants/home-copy.ts` | **Commercialise** | Commercialize |
| Public website | `constants/home-copy.ts` | Rural Farmers Hub founder receiving an ASIP **programme** award | Rural Farmers Hub founder receiving an ASIP program award |
| Public website | `constants/home-copy.ts` | ASIP works across a network of mentors, investors, corporates, technology partners, development institutions and ecosystem **organisations** … | ASIP works across a network of mentors, investors, corporates, technology partners, development institutions and ecosystem organizations … |
| Public website | `constants/home-copy.ts` | **Programme** collaboration that extends founder access to markets, networks and follow-on opportunities. | Program collaboration that extends founder access to markets, networks and follow-on opportunities. |
| Public website | `constants/home-copy.ts` | Ecosystem **organisations** | Ecosystem organizations |
| Public website | `constants/home-copy.ts` | Show the difference in numbers a customer, partner or investor would **recognise**. | Show the difference in numbers a customer, partner or investor would recognize. |
| Public website | `constants/home-copy.ts` | Founder stories, portfolio progress, **programme** updates and useful perspectives from the people building Africa’s next technology companies. | Founder stories, portfolio progress, program updates and useful perspectives from the people building Africa’s next technology companies. |
| Public website | `constants/impact-copy.ts` | **Commercialisation** | Commercialization |
| Public website | `constants/impact-copy.ts` | **Commercialisation** | Commercialization |
| Public website | `constants/impact-fan-copy.ts` | ASIP founders collaborating in a **programme** workshop | ASIP founders collaborating in a program workshop |
| Public website | `constants/impact-fan-copy.ts` | ASIP founders and **programme** community together | ASIP founders and program community together |
| Public website | `constants/impact-fan-copy.ts` | ASIP founders on the **programme** journey | ASIP founders on the program journey |
| Public website | `constants/impact-metric-labels.ts` | **Commercialisation** | Commercialization |
| Public website | `constants/insights-copy.ts` | Founder stories, portfolio progress, **programme** news and practical perspectives from across the ASIP ecosystem. | Founder stories, portfolio progress, program news and practical perspectives from across the ASIP ecosystem. |
| Public website | `constants/insights-copy.ts` | **Programme** Updates | Program Updates |
| Public website | `constants/insights-copy.ts` | Register for confirmed ASIP **programme** updates, founder stories and ecosystem opportunities. | Register for confirmed ASIP program updates, founder stories and ecosystem opportunities. |
| Public website | `constants/legacy-redirects.test.ts` | it("sends legacy entry points to the **localised** home page", () => { | it("sends legacy entry points to the localized home page", () => { |
| Public website | `constants/legal-copy.ts` | ASIP is a Telecel Group **programme** that helps African technology founders test ideas, work with customers and partners, and grow early-sta… | ASIP is a Telecel Group program that helps African technology founders test ideas, work with customers and partners, and grow early-stage… |
| Public website | `constants/legal-copy.ts` | **Programme** capacity, eligibility, and chapter timing can change. Status banners and CTAs (Apply vs Register Interest) reflect the current … | Program capacity, eligibility, and chapter timing can change. Status banners and CTAs (Apply vs Register Interest) reflect the current se… |
| Public website | `constants/legal-copy.ts` | You can create an account with your name, email, and password. Public signup creates a viewer account: you can use signed-in intake forms… | You can create an account with your name, email, and password. Public signup creates a viewer account: you can use signed-in intake forms… |
| Public website | `constants/legal-copy.ts` | We may refuse, suspend, or remove access where we reasonably believe these terms have been breached, or where security or **programme** rules… | We may refuse, suspend, or remove access where we reasonably believe these terms have been breached, or where security or program rules r… |
| Public website | `constants/legal-copy.ts` | Register Interest records a short founder and venture profile for updates when the next chapter opens. Apply is the official **programme** in… | Register Interest records a short founder and venture profile for updates when the next chapter opens. Apply is the official program inta… |
| Public website | `constants/legal-copy.ts` | You agree not to misuse the site — including **unauthorised** access, disrupting services, scraping content at scale without permission, or s… | You agree not to misuse the site, including unauthorized access, disrupting services, scraping content at scale without permission, or su… |
| Public website | `constants/legal-copy.ts` | **Programme** materials, branding, founder stories, insights, and other site content remain the property of Telecel Group, its licensors, or … | Program materials, branding, founder stories, insights, and other site content remain the property of Telecel Group, its licensors, or na… |
| Public website | `constants/legal-copy.ts` | The site and **programme** information are provided on an “as is” basis. We do not guarantee uninterrupted availability, error-free content, … | The site and program information are provided on an “as is” basis. We do not guarantee uninterrupted availability, error-free content, or… |
| Public website | `constants/legal-copy.ts` | How ASIP collects, uses, stores, and protects personal information on this website and related **programme** services. | How ASIP collects, uses, stores, and protects personal information on this website and related program services. |
| Public website | `constants/legal-copy.ts` | ASIP (Africa Startup Initiative Program) is operated as part of Telecel Group’s **programmes**. This policy covers the public website, viewer… | ASIP (Africa Startup Initiative Program) is operated as part of Telecel Group’s programs. This policy covers the public website, viewer a… |
| Public website | `constants/legal-copy.ts` | Apply (signed-in, when applications are open): the same profile fields as Register Interest, plus problem and product description, tracti… | Apply (signed-in, when applications are open): the same profile fields as Register Interest, plus problem and product description, tracti… |
| Public website | `constants/legal-copy.ts` | Public form submissions are written to our database for ASIP administrators. This site does not currently send automatic confirmation ema… | Public form submissions are written to our database for ASIP administrators. This site does not currently send automatic confirmation ema… |
| Public website | `constants/legal-copy.ts` | Admin users with **authorised** access can view and manage intake and contact records inside the dashboard. Viewer accounts cannot access oth… | Admin users with authorized access can view and manage intake and contact records inside the dashboard. Viewer accounts cannot access oth… |
| Public website | `constants/legal-copy.ts` | We retain personal data only as long as needed for **programme** administration, security, and legal requirements, then delete or **anonymise** i… | We retain personal data only as long as needed for program administration, security, and legal requirements, then delete or anonymize it … |
| Public website | `constants/legal-copy.ts` | ASIP is aimed at founders and professional contacts. The site is not directed at children, and we do not knowingly collect personal data … | ASIP is aimed at founders and professional contacts. The site is not directed at children, and we do not knowingly collect personal data … |
| Public website | `constants/marketing-copy.ts` | Since then, ASIP has worked with founders across multiple sectors and markets, combining structured founder development with exposure to … | Since then, ASIP has worked with founders across multiple sectors and markets, combining structured founder development with exposure to … |
| Public website | `constants/marketing-copy.ts` | The second cohort runs from 11 April to 6 July, with in-person **programme** work in Dakar. | The second cohort runs from 11 April to 6 July, with in-person program work in Dakar. |
| Public website | `constants/marketing-copy.ts` | Portfolio support year: follow-on work with founders already in the **programme**, and preparation for the next chapter. | Portfolio support year: follow-on work with founders already in the program, and preparation for the next chapter. |
| Public website | `constants/marketing-copy.ts` | ASIP **programme** leaders and founders in Dakar | ASIP program leaders and founders in Dakar |
| Public website | `constants/marketing-copy.ts` | Explore ventures from each **programme** cycle as profiles are approved. | Explore ventures from each program cycle as profiles are approved. |
| Public website | `constants/marketing-copy.ts` | See how ASIP ventures contribute to communities across Africa - with verified reach, founder outcomes, and **programme** stories. | See how ASIP ventures contribute to communities across Africa - with verified reach, founder outcomes, and program stories. |
| Public website | `constants/marketing-copy.ts` | Your submission is stored securely and reviewed by the ASIP team for each **programme** cycle. | Your submission is stored securely and reviewed by the ASIP team for each program cycle. |
| Public website | `constants/marketing-copy.ts` | For founders", title: "Build what Africa needs next.", description: "Tell ASIP about your team, technology venture, market, and current s… | For founders", title: "Build what Africa needs next.", description: "Tell ASIP about your team, technology venture, market, and current s… |
| Public website | `constants/marketing-copy.ts` | Practical information about the **programme**, applications, founders, and partnerships. | Practical information about the program, applications, founders, and partnerships. |
| Public website | `constants/marketing-copy.ts` | These answers describe the current **programme** structure and will evolve with each published cohort. | These answers describe the current program structure and will evolve with each published cohort. |
| Public website | `constants/marketing-copy.ts` |  title: "Is the **programme** virtual or in person?", description: "The format varies by cohort and may combine virtual sessions, in-person a… |  title: "Is the program virtual or in person?", description: "The format varies by cohort and may combine virtual sessions, in-person act… |
| Public website | `constants/marketing-copy.ts` |  title: "Can investors access the portfolio?", description: "Investors can explore public founder profiles and contact ASIP for relevant … |  title: "Can investors access the portfolio?", description: "Investors can explore public founder profiles and contact ASIP for relevant … |
| Public website | `constants/marketing-copy.ts` |  title: "How can **organisations** partner with ASIP?", description: "Partners can contribute business challenges, pilot opportunities, capit… |  title: "How can organizations partner with ASIP?", description: "Partners can contribute business challenges, pilot opportunities, capit… |
| Public website | `constants/marketing-copy.ts` | Explore answers grouped by **programme**, founders, and partners. | Explore answers grouped by program, founders, and partners. |
| Public website | `constants/marketing-copy.ts` | **Programme** | Program |
| Public website | `constants/marketing-copy.ts` |  title: "Is the **programme** virtual or in person?", description: "The format varies by cohort and may combine virtual sessions, in-person a… |  title: "Is the program virtual or in person?", description: "The format varies by cohort and may combine virtual sessions, in-person act… |
| Public website | `constants/marketing-copy.ts` |  title: "How can **organisations** partner with ASIP?", description: "Partners can contribute business challenges, pilot opportunities, capit… |  title: "How can organizations partner with ASIP?", description: "Partners can contribute business challenges, pilot opportunities, capit… |
| Public website | `constants/marketing-copy.ts` |  title: "Can investors access the portfolio?", description: "Investors can explore public founder profiles and contact ASIP for relevant … |  title: "Can investors access the portfolio?", description: "Investors can explore public founder profiles and contact ASIP for relevant … |
| Public website | `constants/marketing-copy.ts` | **Programme** | Program |
| Public website | `constants/partner-editor-help.ts` | **Organisation** | Organization |
| Public website | `constants/partners-copy.ts` | ASIP works with investors, corporates, technology leaders, development institutions, mentors and ecosystem **organisations** to give founders… | ASIP works with investors, corporates, technology leaders, development institutions, mentors and ecosystem organizations to give founders… |
| Public website | `constants/partners-copy.ts` | Country initiatives, grants, sector **programmes**, impact measurement. | Country initiatives, grants, sector programs, impact measurement. |
| Public website | `constants/partners-copy.ts` | Initiatives pays, subventions, **programmes** sectoriels, mesure d’impact. | Initiatives pays, subventions, programs sectoriels, mesure d’impact. |
| Public website | `constants/platform-stage-slides.ts` | ASIP founder in conversation at a **programme** event | ASIP founder in conversation at a program event |
| Public website | `constants/platform-stage-slides.ts` | ASIP founders celebrating **programme** impact | ASIP founders celebrating program impact |
| Public website | `constants/programme-copy.ts` | The **programme** | The program |
| Public website | `constants/programme-copy.ts` | Teams are assessed against founder quality, problem relevance, product potential, traction, scalability and **programme** fit. | Teams are assessed against founder quality, problem relevance, product potential, traction, scalability and program fit. |
| Public website | `constants/programme-copy.ts` | **Commercialise** | Commercialize |
| Public website | `constants/programme-copy.ts` | A relationship with the portfolio that can continue beyond the cohort, subject to **programme** priorities. | A relationship with the portfolio that can continue beyond the cohort, subject to program priorities. |
| Public website | `constants/programme-copy.ts` | ASIP founders working on laptops during a **programme** session | ASIP founders working on laptops during a program session |
| Public website | `constants/programme-copy.ts` | Ability to participate fully in the published **programme** format and timelines. | Ability to participate fully in the published program format and timelines. |
| CMS content (seed data) | `data/seed/cms/blogs.json` | ["**Programme** Updates", "Cohort 4", "Portfolio"] | ["Program Updates", "Cohort 4", "Portfolio"] |
| CMS content (seed data) | `data/seed/cms/blogs.json` | ["**Programme** Updates", "Cohort 3", "Portfolio"] | ["Program Updates", "Cohort 3", "Portfolio"] |
| CMS content (seed data) | `data/seed/cms/blogs.json` | How ASIP's second cohort combined digital acceleration with in-person **programme** support in Senegal. | How ASIP's second cohort combined digital acceleration with in-person program support in Senegal. |
| CMS content (seed data) | `data/seed/cms/blogs.json` | <p>ASIP Accelerator Cohort 2 combined the Accelerator Squared digital platform with in-person **programme** support in Dakar.</p><h2>Eleven s… | <p>ASIP Accelerator Cohort 2 combined the Accelerator Squared digital platform with in-person program support in Dakar.</p><h2>Eleven sel… |
| CMS content (seed data) | `data/seed/cms/blogs.json` | ["**Programme** Updates", "Cohort 2", "Ecosystem"] | ["Program Updates", "Cohort 2", "Ecosystem"] |
| CMS content (seed data) | `data/seed/cms/blogs.json` | ASIP Accelerator Cohort 2 | Dakar **Programme** | ASIP Accelerator Cohort 2 | Dakar Program |
| CMS content (seed data) | `data/seed/cms/blogs.json` | <p>ASIP's first cohort launched as a fully virtual, three-month accelerator powered by Startupbootcamp AfriTech.</p><h2>Pan-African parti… | <p>ASIP's first cohort launched as a fully virtual, three-month accelerator powered by Startupbootcamp AfriTech.</p><h2>Pan-African parti… |
| CMS content (seed data) | `data/seed/cms/blogs.json` | ["**Programme** Updates", "Cohort 1", "**Programme** History"] | ["Program Updates", "Cohort 1", "Program History"] |
| CMS content (seed data) | `data/seed/cms/blogs.json` | ASIP Accelerator Cohort 1 | **Programme** History | ASIP Accelerator Cohort 1 | Program History |
| CMS content (seed data) | `data/seed/cms/blogs.json` | Learn how ASIP's first virtual accelerator connected eleven African ventures with mentors, partners, and **programme** support. | Learn how ASIP's first virtual accelerator connected eleven African ventures with mentors, partners, and program support. |
| CMS content (seed data) | `data/seed/cms/cohorts.json` | The fourth ASIP accelerator cohort, with Final Selection Days in October 2023. The **programme** ran from 13 November 2023 to 7 February 2024. | The fourth ASIP accelerator cohort, with Final Selection Days in October 2023. The program ran from 13 November 2023 to 7 February 2024. |
| CMS content (seed data) | `data/seed/cms/founder-stories.json` | During the **programme**, SBC AfriTech helped facilitate partnerships with UBA Senegal, ANER, GOGLA, USADF, the All On-Shell Foundation, GIZ,… | During the program, SBC AfriTech helped facilitate partnerships with UBA Senegal, ANER, GOGLA, USADF, the All On-Shell Foundation, GIZ, a… |
| CMS content (seed data) | `data/seed/cms/founder-stories.json` | During the **programme**, Ostafandy signed partnerships with Fanni, Adeer, and 15 local partners, and opened discussions with Senegal's Natio… | During the program, Ostafandy signed partnerships with Fanni, Adeer, and 15 local partners, and opened discussions with Senegal's Nationa… |
| CMS content (seed data) | `data/seed/cms/partners.json` | Digital accelerator platform used for **programme** delivery. | Digital accelerator platform used for program delivery. |
| CMS content (seed data) | `data/seed/cms/partners.json` | **Programme** brand and founding initiative. | Program brand and founding initiative. |
| CMS content (seed data) | `data/seed/cms/startups.json` | Health Insurance is arguably the only way the middle and lower class of any economy can afford quality healthcare. However in Africa the … | Health Insurance is arguably the only way the middle and lower class of any economy can afford quality healthcare. However in Africa the … |
| CMS content (seed data) | `data/seed/cms/startups.json` | Inaccessible working capital to service post-paid loads is a problem being faced by 80% of small scale transporters active in Africa's 30… | Inaccessible working capital to service post-paid loads is a problem being faced by 80% of small scale transporters active in Africa's 30… |
| CMS content (seed data) | `data/seed/cms/startups.json` | Our solution is taking the principle of crowd-funding and thrift, applying it to food. Simply put, cheaper prices for our subscribers by … | Our solution is taking the principle of crowd-funding and thrift, applying it to food. Simply put, cheaper prices for our subscribers by … |
| CMS content (seed data) | `data/seed/cms/startups.json` | Won the best Series A award at the AfricArena summit Nominated as a finalist for the FinTech of the year award by the African Banker Maga… | Won the best Series A award at the AfricArena summit Nominated as a finalist for the FinTech of the year award by the African Banker Maga… |
| CMS content (seed data) | `data/seed/cms/startups.json` | Was selected to participate in the OceanHub Africa Acceleration Program 2022 The team was selected to join the Africa Summit 2022 Ecomak … | Was selected to participate in the OceanHub Africa Acceleration Program 2022 The team was selected to join the Africa Summit 2022 Ecomak … |
| CMS content (seed data) | `data/seed/cms/startups.json` | Pitched at Lions Den, Nigeria and raised USD 96,000 Won the GSMA Innovation Fund Powerstove is a patented innovative IoT- enabled smokele… | Pitched at Lions Den, Nigeria and raised USD 96,000 Won the GSMA Innovation Fund Powerstove is a patented innovative IoT- enabled smokele… |
| CMS content (seed data) | `data/seed/cms/startups.json` | LyfPlus is a telemedicine, tele-diagnosis provider offering affordable and convenient medical services through it's proprietary platform … | LyfPlus is a telemedicine, tele-diagnosis provider offering affordable and convenient medical services through it's proprietary platform … |
| Admin / editor panel | `lib/admin/dummy-form-values.ts` | SMEs struggle to get working-capital decisions fast enough to **fulfil** orders. | SMEs struggle to get working-capital decisions fast enough to fulfill orders. |
| Admin / editor panel | `lib/admin/dummy-form-values.ts` | Dummy primary source: internal **programme** report Q1, verified against CRM exports. | Dummy primary source: internal program report Q1, verified against CRM exports. |
| CMS content (seed data) | `scripts/seed-blogs.mjs` | ASIP shares these insights to help participating ventures and the wider ecosystem learn from real **programme** experience. The examples here… | ASIP shares these insights to help participating ventures and the wider ecosystem learn from real program experience. The examples here a… |
| CMS content (seed data) | `scripts/seed-blogs.mjs` | ["**Programme** Updates", "Design", "Research"] | ["Program Updates", "Design", "Research"] |
| CMS content (seed data) | `scripts/seed-cms.mjs` | Workforce training marketplace that matches employers with modular digital skills **programmes**. | Workforce training marketplace that matches employers with modular digital skills programs. |
| CMS content (seed data) | `scripts/seed-cms.mjs` | Construction cost intelligence that benchmarks materials and **labour** for mid-rise developers. | Construction cost intelligence that benchmarks materials and labor for mid-rise developers. |
| CMS content (seed data) | `scripts/seed-cms.mjs` | Second chapter expanded **commercialisation** clinics and investor dialogue for growth-stage teams. | Second chapter expanded commercialization clinics and investor dialogue for growth-stage teams. |
| CMS content (seed data) | `scripts/seed-cms.mjs` | ASIP **programme** ops export: cohort completion and demo-day attendance (2024). | ASIP program ops export: cohort completion and demo-day attendance (2024). |
| CMS content (seed data) | `scripts/seed-cms.mjs` | **Commercialisation** board: open enterprise pilots across current portfolio. | Commercialization board: open enterprise pilots across current portfolio. |
| CMS content (seed data) | `scripts/seed-cms.mjs` | ["Ada Okonkwo", "Yaw Owusu", "**Programme** lead"] | ["Ada Okonkwo", "Yaw Owusu", "Program lead"] |
| CMS content (seed data) | `scripts/seed-cms.mjs` | ASIP **Commercialisation** Clinic | ASIP Commercialization Clinic |
| CMS content (seed data) | `scripts/seed-cms.mjs` | We want ASIP workshops, operator introductions, and **commercialisation** support to expand into a second market. | We want ASIP workshops, operator introductions, and commercialization support to expand into a second market. |
| CMS content (seed data) | `scripts/seed-partners.mjs` | **Programme** brand presence across ecosystem events and founder showcases. | Program brand presence across ecosystem events and founder showcases. |
| CMS content (seed data) | `scripts/seed-partners.mjs` | Digital hub **programmes** and founder community connections. | Digital hub programs and founder community connections. |
| CMS content (seed data) | `scripts/seed-partners.mjs` | Sector **programmes** and cohort delivery across African markets. | Sector programs and cohort delivery across African markets. |
| CMS content (seed data) | `supabase/seed.sql` | **Programme** brand presence across ecosystem events and founder showcases. | Program brand presence across ecosystem events and founder showcases. |
| CMS content (seed data) | `supabase/seed.sql` | Digital hub **programmes** and founder community connections. | Digital hub programs and founder community connections. |
| CMS content (seed data) | `supabase/seed.sql` | Sector **programmes** and cohort delivery across African markets. | Sector programs and cohort delivery across African markets. |
| Form messages | `validations/application.ts` | **Programme** fit must be at least 20 characters | Program fit must be at least 20 characters |
| Form messages | `validations/application.ts` | **Programme** fit must be at most 2000 characters | Program fit must be at most 2000 characters |
| Form messages | `validations/blog.ts` | First category must be one of the five ASIP streams (Founder Stories, Portfolio News, **Programme** Updates, Founder Resources, or Partner Pe… | First category must be one of the five ASIP streams (Founder Stories, Portfolio News, Program Updates, Founder Resources, or Partner Pers… |
| Form messages | `validations/cohort.test.ts` | it("rejects an unknown **programme** status and invalid link ids", () => { | it("rejects an unknown program status and invalid link ids", () => { |
| Form messages | `validations/partner.test.ts` | it("rejects a one-character **organisation** but allows it to be omitted", () => { | it("rejects a one-character organization but allows it to be omitted", () => { |
| Form messages | `validations/partner.ts` | .max(PARTNER_ORG_MAX, `**Organisation** must be at most ${PARTNER_ORG_MAX} characters`) | .max(PARTNER_ORG_MAX, `Organization must be at most ${PARTNER_ORG_MAX} characters`) |
| Form messages | `validations/partner.ts` | **Organisation** must be at least 2 characters | Organization must be at least 2 characters |
| Public website | `components/marketing/contact-labels.ts` | Choose a founder, partner, media or general **enquiry** route… | Choose a founder, partner, media or general inquiry route… |
| Public website | `components/marketing/contact-labels.ts` | **Enquiry** route (legend and field label) | Inquiry route |
| Public website | `components/marketing/contact-labels.ts` | Pick the route that matches your **enquiry**. | Pick the route that matches your inquiry. |
| Public website | `components/marketing/contact-labels.ts` | Founder / Partner / Media / General **enquiry** | Founder / Partner / Media / General inquiry |
| Public website | `app/[locale]/(marketing)/contact/page.tsx` | Choose a founder, partner, media or general **enquiry** route… | Choose a founder, partner, media or general inquiry route… |
| Form messages | `validations/contact-message.ts` | Choose an **enquiry** route | Choose an inquiry route |
| Public website | `constants/legal-copy.ts` | …additional product, traction, and **programme**-fit detail. | …additional product, traction, and program-fit detail. |
| Public website | `constants/legal-copy.ts` | Optional **programme**-update opt-in is separate. | Optional program-update opt-in is separate. |
| Public website | `constants/legal-copy.ts` | …send founder, partner, media, or general **enquiries**… | …send founder, partner, media, or general inquiries… |
| Public website | `constants/legal-copy.ts` | Contact (may be anonymous): **enquiry** type… | Contact (may be anonymous): inquiry type… |
| Public website | `constants/legal-copy.ts` | …respond to Contact **enquiries**… **Programme**-update opt-in… | …respond to Contact inquiries… Program-update opt-in… |
| Public website (French) | `constants/partners-copy.ts` | Initiatives pays, subventions, **programs** sectoriels, mesure d’impact. | Initiatives pays, subventions, programmes sectoriels, mesure d’impact. (French correction) |
| Admin / editor panel | `components/contact-messages/contact-message-dialogs.tsx` | **Enquiry** route / e.g. Partnership **enquiry** | Inquiry route / e.g. Partnership inquiry |
| Admin / editor panel | `components/contact-messages/contact-messages-filters.tsx` | **Enquiry** route | Inquiry route |
| Admin / editor panel | `components/partners/partner-sort-order-map.tsx` | …free slots are **grey**. | …free slots are gray. |
| CMS content (seed data) | `data/seed/cms/blogs.json` | …hospital **digitisation**… entered the **programme**… | …hospital digitization… entered the program… |
| CMS content (seed data) | `data/seed/cms/blogs.json` | …joined the **programme**. … The **programme** combined… | …joined the program. … The program combined… |
| CMS content (seed data) | `data/seed/cms/startups.json` | Agrodata **optimises** farmlands… A bee-**centred** crops model… | Agrodata optimizes farmlands… A bee-centered crops model… |
| CMS content (seed data) | `data/seed/cms/startups.json` | …**capitalising** on parking spaces… | …capitalizing on parking spaces… |
| CMS content (seed data) | `data/seed/cms/startups.json` | …to **modernise** and empower African retailers… by **digitising** their supply chain… | …to modernize and empower African retailers… by digitizing their supply chain… |
| CMS content (seed data) | `scripts/seed-blogs.mjs` | …**prioritisation**… / **Programme**-specific guidance… | …prioritization… / Program-specific guidance… |
| CMS content (seed data) | `scripts/seed-cms.mjs` | **Digitised** 22,000 border document packs… / Cohort **centred** on… / …**enquiry** #n… | Digitized… / Cohort centered on… / …inquiry #n… |
