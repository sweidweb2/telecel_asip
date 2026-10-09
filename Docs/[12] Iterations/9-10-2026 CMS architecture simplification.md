# CMS architecture — can this branch be simpler?

**Date:** 9 October 2026  
**Branch:** `dev`  
**Scope:** Staff CMS — Editor (`/dashboard/*`) and Admin (`/admin/*`). Marketing pages are out of scope.  
**Method:** Read-only. No code was changed.  
**Question:** Can the CMS code on this branch be simplified with a different architecture?

## Answer

**Yes.**

The layers are already the right ones: `data/` reads, `actions/` writes, Zod in `validations/`, a light resource registry, and shared runners (`runAdminMutation`, `loadAdminListPage`, `refreshAdminResource`, `gateEditorPageData`). A new CMS product, a schema-driven form engine, or one merged staff app would add machinery this codebase does not need.

What is heavy is the **half-finished kit**. Shared helpers exist, then each resource copies the rest of the page, the write, and the role check. The simpler architecture is to finish that kit and leave domain rules in the resource.

## How to read a block

Each finding is one block. Severity is on the block, not in a separate list.

| Severity | Meaning |
| --- | --- |
| **High** | Two ways of doing the same job. New resources and bugfixes drift. |
| **Medium** | The same chrome or write is copied. A small shared piece removes it. Domain fields stay put. |
| **Low** | Thin copies. Safe to leave until the next edit of that file. |

## Already in good shape

These stay. They are the architecture to extend.

| Piece | Role |
| --- | --- |
| `data/` vs `actions/` | Reads during render, writes from forms. |
| `runAdminMutation` | Zod, editor session, Postgres error map, refresh. |
| `refreshAdminResource` | List path, detail path, cache tags, nav counts. |
| `loadAdminListPage` | Fetch, forbidden redirect, page clamp. |
| `parseAdminListQuery` | Search-param parsing for lists. |
| `ADMIN_RESOURCES` | Titles, paths, cache tags. Schemas and columns stay out of it. |
| `StaffShellLayout` | One shell. Admin and Editor layouts only differ by nav, badge counts, and who is allowed in. |
| `UsersListPage` | One Users list, mounted by both shells. |
| `runInboxStatusMutation` | One inbox-status write for applications, registrations, and contact. |
| `fetchAdminListStats` | One stats RPC per list. |

---

## ✅ A1 · High · Two role gates for the same CMS read

| | |
| --- | --- |
| **Severity** | High |
| **Simplify?** | Yes |
| **Status** | ✅ Done |

**Was**

List loaders split into two styles.

- Gate first, then load: `gateEditorPageData` in blogs, startups, applications, registrations, contact messages, newsletter.
- Check and query together: `isCurrentUserEditor()` inside `Promise.all` with the list and the stats, in events, cohorts, partners, founder stories, impact metrics, evidence.

Detail loaders (`getEventByIdForAdmin`, `getBlogByIdForAdmin`, and the same shape on the other catalogue resources) hand-rolled the check again, including on blogs, whose list already used the gate.

The parallel style started the Supabase read before the role check had returned. RLS still applied. The control flow was the problem: one resource awaited the gate, the next did not.

**Now**

Catalogue lists, detail reads, option pickers, inbox row reads, and `getAdminAnalytics` go through `gateEditorPageData`. The role check returns before `createClient()` and before `load`. Detail reads call that helper inside the existing `cache()` + `wrapCached` wrapper. A missing row is mapped to `not_found` after the gate, so the helper’s `{ status: "ok" }` payload stays a row or `null`.

Option pickers pass `eventType: "option_load"` so the perf span keeps its old type.

Left as they were, on purpose:

- `data/admin-perf-events.ts` — those reads must not enter `traceAsync`. The gate traces, and tracing a perf read writes the table it is reading.
- `data/settings.ts` — the admin check chooses whether backup time is included. It is not a page gate.
- `requireEditor` / `requireAdmin` in `data/auth.ts` — route redirects, not data loads.

---

## ✅ A2 · High · Create and edit routes repeat one page

| | |
| --- | --- |
| **Severity** | High |
| **Simplify?** | Yes |
| **Status** | ✅ Done |

**Was**

Catalogue create and edit routes were the same file with the nouns swapped: `StaffMain`, a two-item breadcrumb, forbidden → dashboard, missing → `notFound()`, then the resource form.

That pair existed for blogs, events, cohorts, partners, portfolio, founder stories, impact metrics, and evidence. `blogs/new/page.tsx` and `events/new/page.tsx` differed by the form and the labels. The edit routes differed by the loader and the title field (`title` vs `name`).

**Now**

`components/dashboard/cms-editor-page.tsx` owns the breadcrumb and the gate. Create routes pass the list path, the list label, the crumb, and the form. Edit routes pass `load` and a render function for the form. Document titles stay on the route, because each resource names the record differently.

Partner create still loads display-order slots. Partner edit still loads the partner and those slots together, and redirects if either read is forbidden. Users, settings, backup, and performance stay custom.

---

## ✅ A3 · Medium · List routes repeat one shell

| | |
| --- | --- |
| **Severity** | Medium |
| **Simplify?** | Yes |
| **Status** | ✅ Done |

**Was**

`loadAdminListPage` already covered fetch, forbidden, and clamp. Each list route still repeated the rest: parse the query, build clamp params, render `AdminListPageShell`, a “New …” button, a stats-card function, and a table.

`dashboard/blogs/page.tsx` and `dashboard/events/page.tsx` were the same function. Blogs added sort params to the clamp; events did not. The table and the stats config were the real differences.

Stats cards in `components/dashboard/cms-list-stats.tsx` were already a config array passed to `AdminStatsCards`.

**Now**

`components/dashboard/cms-list-page.tsx` takes the resource id, the query parser, the page loader, the active filters, optional stats, and the table. Catalogue lists pass a “New” link and the public-reflection dialog. Inbox lists pass a CSV download and no “New” button. Newsletter omits stats.

Column definitions stay in each table. `ADMIN_RESOURCES` still has no schemas or columns. The Users list stays on `UsersListPage` because both shells mount it with a role, a create dialog, and an editor-only note.

---

## ✅ A4 · Medium · Plain-table writes repeat create, update, and delete

| | |
| --- | --- |
| **Severity** | Medium |
| **Simplify?** | Yes, for plain tables only |
| **Status** | ✅ Done |

**Was**

`runAdminMutation` is the right outer flow. Inside it, two write styles remained.

- RPC + JSON mapper: blogs (`create_blog_with_featured`), events (`create_event_with_links`), cohorts, startups. The mapper and the RPC arguments are the domain.
- Direct table write: founder stories, evidence, impact metrics, and the partner flag toggles. Each one inserted or updated, `.select("id")`, mapped a Postgres error, and refreshed. Deletes selected `id` first, then deleted, to tell “not found” from a constraint failure.

`actions/founder-stories.ts` and `actions/evidence-records.ts` opened with the same messages object, the same `refreshAdminResource` wrapper, and the same three exports. Evidence adds owner and “in use” messages. Those extra messages stay with the resource.

Blogs refreshed inside `execute` (`refreshBlogPaths`) and did not use the `refresh` callback that events and cohorts use. A failed path could revalidate work that did not commit.

**Now**

`lib/admin/write-admin-row.ts` inserts, updates, or deletes one row. The caller passes the id and the row. A missing row returns the resource’s not-found message. A Postgres error goes back to `runAdminMutation` to map. Evidence delete still passes `pgContext: "delete"` so an in-use record keeps its foreign-key message.

Founder stories, evidence, impact metrics, and the partner active / logo-permission toggles use it. Partner create and update still displace sort order before the row write. Partner delete still removes the storage folder after the row is gone.

Blogs, events, cohorts, startups, users, and public intake keep an explicit `execute`. Blog update, status, and delete call `refreshBlogPaths` from the `refresh` callback, including the previous slug when the RPC changes it. Image uploads still refresh after the file lands.

---

## A5 · Medium · Editor forms repeat the stepper chrome

| | |
| --- | --- |
| **Severity** | Medium |
| **Simplify?** | Yes, for the chrome. Leave the fields. |

**Today**

Shared pieces already exist: `AdminEditorActionsBar`, `UnsavedChangesGuard`, `AdminFormSection`, `AdminDeleteDialog`, `EntityMultiSelect`, `firstInvalidEditorStep`.

Each form still rebuilds steps, submit, pending state, toasts, redirect, delete, and dev-only dummy fill.

| Form | Lines |
| --- | --- |
| `blog-editor-form.tsx` | ~1,270 |
| `startup-editor-form.tsx` | ~1,210 |
| `partner-editor-form.tsx` | ~760 |
| `founder-story-editor-form.tsx` | ~750 |
| `impact-metric-editor-form.tsx` | ~690 |
| `cohort-editor-form.tsx` | ~650 |
| `evidence-editor-form.tsx` | ~650 |
| `event-editor-form.tsx` | ~620 |

Most of the blog and startup length is real fields (body HTML, sources, startup detail blocks). The first ~80 lines of event and cohort forms are the same imports and the same stepper setup.

**Simpler shape**

`CmsEditorFrame` plus a small hook: mode, schema, create action, update action, delete action, list path, steps. The form file only renders fields per step.

Generating inputs from Zod would fight the blog body, the startup blocks, and the partner permission toggles. Those stay handwritten.

---

## A6 · Medium · Public intake and staff edits share one action file

| | |
| --- | --- |
| **Severity** | Medium |
| **Simplify?** | Yes |

**Today**

`actions/applications.ts` (~240 lines) and `actions/interest-registrations.ts` (~270 lines) each contain:

- bilingual public success and error copy
- Turnstile and `guardPublicFormSubmission`
- the open/closed programme rule
- staff update, delete, and inbox status

A public visitor and an editor are different callers, different sessions, and different rate limits. `runInboxStatusMutation` already pulled the status write out. The public submit is still sitting next to the staff CRUD.

**Simpler shape**

One module for the public submit (`submitApplication`, `submitInterestRegistration`) and one module for the staff row (`update` / `delete`, calling `runInboxStatusMutation`). Same pattern as contact, if contact still mixes both.

Staff list and dialog code does not need the Turnstile copy, and the public form does not need the editor messages.

---

## A7 · Medium · Perf tracing wraps the inside of the CMS, not only the edge

| | |
| --- | --- |
| **Severity** | Medium |
| **Simplify?** | Yes |

**Today**

`traceAsync` is on the admin layout, the editor layout, `loadAdminListPage`, `runAdminMutation`, `gatePageDataByRole`, and again on individual loaders (`getEventsPageData`, detail reads, and similar). With tracking on, each span inserts a row through `persistAdminPerfEvent` (fire-and-forget, never awaited).

One list navigation can record the layout, the page load, and the data function for the same wait. The names are useful. The nesting makes every data function carry an observability argument (`name`, `eventType`, `cacheStatus`) that is not part of loading events or blogs.

**Simpler shape**

Trace three boundaries only:

1. Layout (`getStaffShell`)
2. Page load (`loadAdminListPage` or the detail page)
3. Mutation (`runAdminMutation`)

Inner fetches stay plain async functions. The performance screen still shows which page and which action was slow. It stops showing the same work three times.

---

## A8 · Low · Row actions are a short copy of edit + delete

| | |
| --- | --- |
| **Severity** | Low |
| **Simplify?** | Yes, when those files are next touched |

**Today**

`event-row-actions.tsx` and `cohort-row-actions.tsx` are the same component: ghost edit button, `AdminRowDelete`, label, href, delete action. The same file exists for blogs, partners, startups, founder stories, impact metrics, and evidence.

**Simpler shape**

One `AdminEditDeleteActions` with the edit href, the accessible name, the delete action, and the confirm copy. `AdminRowDelete` already holds the dialog.

---

## A9 · Low · List skeletons are wrappers around one skeleton

| | |
| --- | --- |
| **Severity** | Low |
| **Simplify?** | Optional |

**Today**

`BlogsPageSkeleton` and `EventsPageSkeleton` return `AdminListPageSkeleton` with a title width, a filter count, and a column count. Same for the other list resources.

**Simpler shape**

Call `AdminListPageSkeleton` from each `loading.tsx` with those three props. A factory function would save less than it hides.

Leave this until a list layout actually changes.

---

## What to leave alone

| Area | Why it stays |
| --- | --- |
| Separate `/admin` and `/dashboard` trees | Admin is redirected out of the editor, and the editor is redirected out of admin. Badge counts exist only on the editor. Merging them would reintroduce role branches in every layout. |
| `ADMIN_RESOURCES` without schemas or columns | The file already says it is titles, paths, and tags. Putting forms in that map recreates a CMS framework inside constants. |
| RPC writes for blogs, events, cohorts, startups | Featured posts, link tables, and startup detail JSON are database rules. A generic insert would move those rules back into TypeScript. |
| Users, backup, site settings | Auth admin API, backup jobs, and the admin/editor settings split are not catalogue CRUD. |
| Handwritten blog and startup fields | Length here is the form, not duplicated chrome. |
| Inbox status helper | Already one function for three tables. |

## Target shape

```
route (thin page.tsx)
  CmsListPage / CmsEditorPage
    data/<resource>          ← gateEditorPageData only
    components/<resource>    ← columns and fields only

actions/<resource>
  runAdminMutation
    writeAdminRow            ← single-table insert / update / delete
    execute                  ← RPC, images, public submit
```

Public submit lives in its own action module (A6). Perf spans sit on the layout, the page load, and the mutation (A7).

## If this is implemented later

Do it in this order. Each step stands on its own.

1. ✅ **A1** — Catalogue lists, detail reads, option pickers, inbox rows, and analytics use `gateEditorPageData`. Perf-event reads stay outside the gate.
2. ✅ **A2** — `CmsEditorPage` owns the breadcrumb and the gate. Routes keep their loader, form, and document title.
3. ✅ **A4** — `writeAdminRow` for founder stories, evidence, impact metrics, and partner flag updates.
4. ✅ **A3** — `CmsListPage` owns parse, clamp, and the list shell. Routes keep filters, stats, and the table.
5. **A5** — editor frame the next time a form is opened for a real change. Blog and startup fields move last, if at all.
6. **A6** and **A7** — separate passes. They do not unblock the others.

A8 and A9 can ride along with any edit in those files. They are not their own project.
