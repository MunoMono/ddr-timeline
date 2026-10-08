---
document_type: statement_of_work
project: DDR Timeline
repository: ddr-timeline
version: 1.0.0
status: ready_for_implementation
created: 2026-10-08
owner: DDR research project
period: "1965-1985"
work_packages:
  - SOW-01
  - SOW-02
  - SOW-03
  - SOW-04
  - SOW-05
  - SOW-06
stack: [React, Vite, TypeScript, D3.js, IBM Carbon, GraphQL, GitHub Pages]
data_endpoint: https://api.ddrarchive.org/graphql
hosting: GitHub Pages
consumers: [ddrarchive.org, innovationdesign.io]
architecture: single_deployment_embedded_in_two_sites
backend_required: false
additional_database_required: false
---

# DDR Timeline (1965–1985) — Master Statement of Work

**Implementation contract · v1.0 · 8 October 2026**

> **Delivery principle:** Implement six sequential, independently testable SoWs. Do not invent dates, institutional relationships, API fields or provenance. A visually compelling timeline is not permission to assert unsupported historical facts.

## 0. Executive brief

Build a production-ready, accessible, interactive historical timeline for the Royal College of Art's Department of Design Research (DDR), covering **1965–1985**. Use Cooper Hewitt Labs' *A Timeline of Event Horizons* as an **interaction and visualisation precedent**, not as a dependency or mandatory reproduction. Deliver one independently hosted React application consuming the existing public GraphQL API at `https://api.ddrarchive.org/graphql`. Integrate the same deployed app in `ddrarchive.org` and `innovationdesign.io`, initially by responsive iframe. No PostgreSQL, new content-management system or application-specific server is planned.

### 0.1 Outcomes

1. Visitors can explore documented **institutional periods**, **research projects**, **staff**, and **students** along a common time axis.
2. Visitors can filter, inspect, zoom and discover documented cross-entity links while retaining historical context.
3. Record-level provenance, date precision and epistemic limits remain legible. Never turn a single dated reference into an employment interval or a duration ceiling into a project start/end date.
4. One release updates both host sites, with reproducible deployment, tests, rollback and audit evidence.
5. The frontend is maintainable and can consume evolving API responses through a tested adapter layer.

### 0.2 Scope baseline / evidence presently available

The following are **observed sample shapes**, not a verified live GraphQL schema:

| Collection | Observed keys | Sample count | Temporal suitability |
|---|---|---:|---|
| `ref_ddr_period` | `slug`, `label`, `description` | 8 entries in provided message | Ranges encoded in `slug`; parse cautiously. `1965-1985` is the encompassing envelope. |
| `ddr_projects` | `job_number`, `title`, `funder_name`, `duration_text`, `project_lead_name` | 92 supplied records | No explicit start or end dates in sample. **Do not position by guess.** |
| `ref_students` | `code`, `programme`, `label`, `year`, `degree`, `thesis_title` | 92 supplied records | A single documented year; render event marker, not study interval. |
| Staff | Not supplied | Unknown | Requires API discovery and evidence-grounded date policy. |

Sample data issues to preserve and flag, not silently repair: project `duration_text` values include `≤ 12 months`, `≤ 5 years` and string `"Null"`; project leads have spelling variants; student names may repeat with different degrees/years; `null` and string `"Null"` both occur. Data-quality issues belong in a diagnostic report. Do not merge people solely by name.

**External dependencies to verify before coding against them:** public API availability; GraphQL introspection policy; exact root field names, argument types, pagination conventions, identifiers and provenance fields; CORS permissions for GitHub Pages and both host domains; authentication requirements; rate limits; cache headers. The URL alone does not establish a schema or browser compatibility.

### 0.3 Non-goals

- Editing archival records in this app; mutating the GraphQL API.
- New database, GraphQL server, Python API, AI answer generation or RAG integration.
- Automatic inference of undated project chronology, dates of attendance, employment spans, causality or personal links.
- A full graph/network visualisation, GIS map or unrestricted archival search platform.
- Maintaining separate copies of the timeline for the two hosts.
- Reusing Cooper Hewitt's outdated implementation unchanged.

### 0.4 Target architecture

```text
api.ddrarchive.org/graphql (existing authority)
          |
          | typed, read-only GraphQL queries / validated payloads
          v
    ddr-timeline (React + TypeScript + Vite)
      |-- graphql client + schema-aware adapters
      |-- normalised, provenance-aware domain model
      |-- D3 temporal geometry / brush / scales
      |-- IBM Carbon shell, controls and tokens
      |-- tests + build + deployment pipeline
          |
          v
 GitHub Pages / optional custom timeline subdomain
          |
     +----+-------------------+
     |                        |
 ddrarchive.org         innovationdesign.io
 responsive iframe      responsive iframe
 optional postMessage   optional postMessage
```

**Source of truth:** the existing API. **Frontend state:** browser-local ephemeral application state. **Static fixtures:** tests and offline development only; never silently substituted for missing live data in production.

### 0.5 Delivery standards (all SoWs)

- React function components, strict TypeScript, Vite, npm and lockfile; no unsupported version pins. Install current mutually compatible stable releases and record exact versions in the lockfile.
- IBM Carbon React components and design tokens; D3 modules for scales, axes, brushing/zoom and layouts where needed. D3 owns SVG geometry; React owns component structure/state. Avoid D3 modifying DOM owned by React.
- Accessible HTML/SVG: keyboard operability, visible focus, semantic labels, non-colour-only encoding, reduced-motion support; target WCAG 2.2 AA and document any gaps.
- Responsive: desktop-first complex timeline, usable tablet and mobile fallback (stacked list/overview instead of illegible shrinking chart).
- Tests for parsing, filters, date uncertainty, API adapter, core interactions and embed messaging; static analysis and build checks in CI.
- Every work package produces README/ADR updates, reproducible test logs, screenshots and explicit PASS/FAIL acceptance receipts.
- No secrets or authenticated privileged tokens in browser code, GitHub Pages assets or Vite `VITE_*` variables.
- No unreviewed external analytics/tracking; document privacy and content/security decisions.
- All source code, fixtures and deployment configuration committed; no manual post-build edits to `dist/`.

### 0.6 Suggested repository structure

```text
ddr-timeline/
  .github/workflows/ci.yml
  .github/workflows/deploy.yml
  docs/
    architecture.md
    graphql-contract.md
    data-dictionary.md
    temporal-semantics.md
    accessibility.md
    integration.md
    operations.md
    acceptance/
  public/
  src/
    app/
    components/
      Timeline/
      EntityDrawer/
      Filters/
      Overview/
      States/
    data/
      graphql/
      adapters/
      schema/
      selectors/
    domain/
    hooks/
    styles/
    utils/
  tests/
    fixtures/
    unit/
    integration/
    e2e/
  .env.example
  index.html
  package.json
  package-lock.json
  vite.config.ts
  README.md
```

## 1. Work package schedule and gates

| ID | Name | Dependency | Delivery gate |
|---|---|---|---|
| SOW-01 | Bootstrap, architecture and Carbon foundation | None | Scaffold builds, CI passes, documented integration contract |
| SOW-02 | Live GraphQL discovery, normalisation and temporal integrity | 01 | Verified contract, stable adapters, zero fabricated chronology |
| SOW-03 | D3 interactive temporal visualisation | 02 | Navigation, marks, brush/zoom and selection demonstrably work |
| SOW-04 | Carbon UX, accessibility and research interactions | 03 | Usable polished interactions with complete states and keyboard support |
| SOW-05 | Provenance, historical QA and test suite | 02–04 | Historical invariants and audited fixture/live-data behaviour PASS |
| SOW-06 | GitHub Pages, dual-site embedding and operations | 01–05 | Both live host integrations, deploy/rollback/runbook PASS |

**Gate discipline:** implement in sequence; do not label later phases complete because a mockup renders. Keep a machine-readable acceptance report for each phase and stop on release-blocking failures.

---

# SOW-01 — Project bootstrap, architecture and Carbon foundation

**ID:** `SOW-01`  
**Objective:** Create a clean, reliable repository from scratch with an agreed component/data/deployment architecture.

## Required tasks

- [ ] Initialise `ddr-timeline` as Vite **React + TypeScript** with npm; run locally using VS Code terminal.
- [ ] Install Carbon React, its required styles/icons, and D3 with TypeScript definitions as needed; verify compatibility from official package documentation during implementation.
- [ ] Establish Carbon typography, spacing, layering, interactive states and light theme using official tokens. Avoid arbitrary hard-coded IBM-blue equivalents if a token exists.
- [ ] Build app shell: header, timeline region, responsive filter area, details region, footer/status; initial informative empty states.
- [ ] Set TypeScript strictness, ESLint, formatting policy, basic test runner and browser E2E framework (e.g. Vitest + Testing Library + Playwright).
- [ ] Define base URL strategy for GitHub Pages repository path or custom subdomain; avoid hard-coded absolute asset paths.
- [ ] Decide and document iframe-first integration, message contract version and origin allowlist design; actual integration in SOW-06.
- [ ] Add CI for install, lint, typecheck, unit tests and build; add `.env.example` with `VITE_GRAPHQL_ENDPOINT` (public URL only).
- [ ] Add architectural decision record explaining why no new database or backend is required.
- [ ] Add README with Windows/VS Code commands and repository workflow.

## Developer bootstrap (illustrative; versions resolved at installation)

```bash
npm create vite@latest ddr-timeline -- --template react-ts
cd ddr-timeline
npm install
npm install @carbon/react @carbon/icons-react d3
npm install -D @types/d3 vitest @testing-library/react @testing-library/jest-dom jsdom playwright @playwright/test
npm run dev
```

Package installation may be refined to avoid redundant Playwright packages or use more granular `d3-*` modules. CI must use `npm ci`, not `npm install`. Setup commands assume the destination directory does not already exist.

## Acceptance tests

- `S01-01` Fresh checkout + `npm ci` completes.
- `S01-02` `npm run dev` renders a Carbon-styled app shell without browser errors.
- `S01-03` `npm run lint`, `npm run typecheck`, `npm test -- --run` (or documented equivalent) and `npm run build` pass.
- `S01-04` Desktop and 375px/mobile shell renders without horizontal page overflow.
- `S01-05` README, architecture ADR, endpoint configuration and deploy base-path approach exist.

**Deliverables:** working repo; app shell; dependency lockfile; CI; ADR; README; `docs/acceptance/SOW-01.md`.  
**Exit:** **PASS** only when every test passes.

---

# SOW-02 — GraphQL data contract and defensible temporal model

**ID:** `SOW-02`  
**Objective:** Read the live API without inventing fields, normalise heterogeneous records and express uncertainty explicitly.

## Required tasks

- [ ] Check the GraphQL endpoint from the target browser origin; record access/CORS/authentication outcome.
- [ ] Query schema introspection if allowed. If disabled, obtain existing published schema/API examples from the API maintainer; never guess field names or query arguments.
- [ ] Verify actual queries and pagination for institutional periods, projects, staff and students. Document which collections are available and any provenance/source fields; staff is **not yet schema-confirmed**.
- [ ] Record query operation names, selected fields, pagination/cursor conventions, errors, counts, rate limiting and date interpretation in `docs/graphql-contract.md`.
- [ ] Add typed GraphQL operations, generated types if feasible, a small read-only client, configurable endpoint and robust fetch error handling. Avoid multiple parallel requests that overload the API; paginate incrementally if necessary.
- [ ] Decide fetch strategy: browser direct for public CORS-permitted data; if impossible, **block and record architectural change request** rather than surreptitiously deploying an undocumented proxy.
- [ ] Map each collection into canonical entities with `id`, `type`, `label`, `temporalEvidence`, `metadata`, `relationships`, `sources`, `rawReference` where supported. Avoid inferring canonical identity from a name alone.
- [ ] Build deterministic selectors for counts, year windows, text search, entity types and documented associations.
- [ ] Support source nulls (actual `null`, blank strings, string `"Null"`) without losing the distinction from a genuine value; document normalisation warnings.
- [ ] Add snapshot/test fixtures from user-provided samples and sanitized live API responses; ensure no fixtures masquerade as live data.
- [ ] Define data freshness/revalidation policy and show last successful fetch time in the UI; error and retry states are mandatory.

## Temporal policy — mandatory

| Evidence | Permitted geometry | Forbidden interpretation |
|---|---|---|
| Explicit period `1965-71`, `1971-72` etc. | Interval, annotated as year-precision if that interpretation is substantiated | Exact day boundaries without evidence |
| Encompassing period `1965-1985` | Overall domain / envelope | Additional competing phase row |
| Student `year: 1983` | Dated year marker or year-bin event | Entire course duration; admission date |
| Project `duration_text: "≤ 12 months"` without dates | Undated searchable record with duration note | Place project at inferred position in timeline |
| Staff name/title without dated association | Undated register item | Employment interval |
| Record with only start or end evidence | Clearly open-ended / partial-boundary graphic **only if supported by temporal semantics** | Fabricating the other endpoint |
| Uncertain/approximate range | Explicit patterned/dashed treatment and explanation | Solid exact-duration bar |
| Unknown/invalid date | Non-timeline register + diagnostic | Dropping silently or using the current year |

**Critical nuance:** Treat shorthand such as `1971-72` as a **calendar-year span**, not a precise 1 January 1971 to 31 December 1972 assertion. Plotting may use an internal year-bound representation, with uncertainty/precision explained to users. Endpoint exclusivity/interval algorithms must be documented and tested.

## Canonical type sketch (proposal, not API claim)

```ts
type EntityKind = 'period' | 'project' | 'staff' | 'student';
type TemporalEvidence =
  | { kind: 'year'; year: number; precision: 'year'; sourceIds: string[] }
  | { kind: 'range'; startYear: number; endYear: number; precision: 'year'; certainty: 'documented' | 'approximate'; sourceIds: string[] }
  | { kind: 'open-range'; startYear?: number; endYear?: number; precision: 'year'; sourceIds: string[] }
  | { kind: 'undated'; note?: string };
type Relation = { targetId: string; relationType: string; sourceIds: string[] };
type TimelineEntity = {
  id: string;
  kind: EntityKind;
  label: string;
  temporal: TemporalEvidence;
  metadata: Record<string, unknown>;
  relations: Relation[];
  sourceRefs: Array<{ id: string; url?: string; title?: string }>;
};
```

Do not require `sourceIds` to be populated when the API has no provenance fields; distinguish `unavailable` from verified absence. The sketch can be adjusted in an ADR when the schema is known.

## Acceptance tests

- `S02-01` Live GraphQL query succeeds for every available required collection; unavailable collection explicitly classified and blocked or scope-adjusted via signed decision.
- `S02-02` Schema and sample request/response traces documented; no guessed fields in production query code.
- `S02-03` All 92 supplied project and 92 supplied student fixtures parse without crashes; any rejected row appears in diagnostics.
- `S02-04` Student year produces point, not interval; project ceiling-duration produces undated record, not bar.
- `S02-05` `"Null"` and `null` display as missing, not the literal string or a fabricated person/funder.
- `S02-06` Duplicate names with distinct record IDs remain distinct unless authoritative ID/relationship supports merging.
- `S02-07` API errors, CORS failures, partial pagination and retry are tested.
- `S02-08` Filtering a date range does not claim undated projects are inactive.

**Deliverables:** verified GraphQL contract; adapters; typed domain models; fixtures; temporal-semantics ADR; data diagnostics; acceptance receipt.  
**Exit:** **PASS** only with proven API behaviour and no silent chronology inference.

---

# SOW-03 — D3 timeline engine and historical exploration

**ID:** `SOW-03`  
**Objective:** Implement the central temporal visualisation inspired by Cooper Hewitt Event Horizons.

## Required tasks

- [ ] D3 year/time scale spanning 1965–1985 inclusive in presentation; tick density responds to available width.
- [ ] Overview institutional phase bands with readable labels; period `1965-1985` serves as the enclosing domain.
- [ ] Categorised lanes: periods, projects, staff and students; collapsed by default as needed to keep density manageable.
- [ ] Render dated year events as points and documented intervals as bars; show approximate/open-ended statuses using shapes/patterns and accessible text, not colour alone.
- [ ] Include **Undated projects / unresolved chronology** as a deliberate, discoverable register rather than presenting them on an invented axis.
- [ ] Implement range brush (overview mini-map), controlled zoom/pan, zoom reset, selectable marks and selected-year display.
- [ ] Coordinated hover/focus/selection: active entity is highlighted and inspector updates persistently on click/tap/Enter.
- [ ] Add progressive-disclosure grouping, row virtualization or aggregation where large datasets stress DOM/performance.
- [ ] Avoid overlapping labels; use collision-resistant layout, truncation + accessible full titles and expansion/detail views.
- [ ] Preserve filters and selected record when zooming; clicking background does not unexpectedly clear research state.
- [ ] Support reduced motion and provide non-drag alternative to set time range using accessible start/end year controls.
- [ ] Avoid suggesting a relationship simply because marks overlap in time.

## Visual encodings

| Data state | Proposed encoding |
|---|---|
| Institutional phase | Muted horizontal background band |
| Documented interval | Continuous bar |
| Approximate year-range | Dashed / patterned bar with `Approximate` label |
| Single documented year | Point/diamond mark |
| Open boundary | Endpoint cap / arrow plus accessible explanatory label |
| Not chronologically located | Separate undated list / register |
| Selected / focused | Carbon interaction tokens, outline and coordinated emphasis |
| Relationship | Only explicit API-supported link; otherwise no connector |

## Acceptance tests

- `S03-01` 1965–1985 axis and seven subordinate phase bands display correctly.
- `S03-02` Brush and zoom update viewport without changing underlying data.
- `S03-03` A 1983 student is represented as a 1983 event, not a multi-year interval.
- `S03-04` Project Job 171 is discoverable with lead/funder/duration, but remains undated unless source dates exist.
- `S03-05` Click, touch, keyboard and alternate year-range controls can select/explore marks.
- `S03-06` Stable layout at 1440px, 1024px and 375px widths; no illegible chart scaling.
- `S03-07` All marks have an accessible textual equivalent in list/detail view.
- `S03-08` Performance evidence captured on full fetched collection; investigate and document thresholds if interactions become sluggish.

**Deliverables:** D3 timeline, overview, brush/zoom, categories, event geometry, undated register and visual regression samples.  
**Exit:** **PASS** when temporal correctness and the interaction suite pass.

---

# SOW-04 — Carbon UX, navigation and detail inspection

**ID:** `SOW-04`  
**Objective:** Deliver a coherent, polished public-facing research interface using Carbon design components and tokens.

## User experience

**Default view:** overview of the department's 1965–1985 history; phase bands visible; concise explanation and legend.  
**Primary navigation:** `Overview`, `Periods`, `Projects`, `Staff`, `Students` as filters/views, not routes requiring page reload.  
**Core workflow:** select time range -> choose group -> inspect mark/record -> follow source link -> return without losing context.

## Required tasks

- [ ] Header: title, date range, description, live-data status and methodology link.
- [ ] Carbon controls: entity toggles, DDR/DEU student programme filter, free-text search, reset filters, range inputs and clear selection.
- [ ] Record inspector (responsive side panel on desktop, drawer/sheet on mobile) for label, historical year/range, metadata and evidence status.
- [ ] Project inspector: job number, project title, funder, lead and duration text, with unknown dates plainly signalled.
- [ ] Student inspector: programme, documented year, degree and thesis title where present, avoiding assumption that `year` is graduation year until verified by API semantics.
- [ ] Period inspector: phase title, description and range with explanation of date precision.
- [ ] Staff inspector: fields present in verified API only; no fabricated biography or dates.
- [ ] Supported links to archival source/PID/hosted detail pages; if no source URL present, show `Source link not supplied` rather than inventing one.
- [ ] Clear loading, no records, partially loaded, stale, network failure and malformed record states.
- [ ] URL query parameters for shareable state (`from`, `to`, `types`, `q`, `selected`) with strict parsing and clamping; no personal data in URLs.
- [ ] Document accessibility: labels, tab sequence, skip link, landmark structure, drawer focus trap/return, announcements, contrast and reduced motion.
- [ ] Use motion sparingly (selection transitions/zoom), with deterministic fallback.
- [ ] Write explanatory microcopy distinguishing `not documented in supplied data` from `did not occur`.

## Acceptance tests

- `S04-01` Search, group filters, programme toggle and date range combine and reset deterministically.
- `S04-02` Inspector shows each of the four entity categories using only supported fields.
- `S04-03` Browser Back/Forward and URL reload reproduce a valid shareable selection where record exists.
- `S04-04` Screen reader/keyboard test covers primary research workflow, including accessible undated register.
- `S04-05` Empty/error/loading states are understandable and actionable; no blank chart or silent fallback.
- `S04-06` Carbon tokens govern colour, typography, focus and spacing; no redundant bespoke parallel design system.
- `S04-07` Mobile remains navigable and usable without precision pointer input.

**Deliverables:** complete interaction UI, inspector components, accessibility review, UX screenshots and acceptance receipt.  
**Exit:** **PASS** after functional and accessibility review.

---

# SOW-05 — Archival provenance, QA, regression and release integrity

**ID:** `SOW-05`  
**Objective:** Make the timeline an academically defensible historical instrument, not merely a plausible graphic.

## Required tasks

- [ ] Implement a source/evidence model that preserves what the API actually supplies, with fields for unknown/absent/unverified source information.
- [ ] Keep source record, catalogue metadata, user-facing interpretation and derived visual position conceptually and technically distinct.
- [ ] Establish documented association semantics: project lead is a role as given; matching a staff or student name does not by itself prove identical person or employment chronology.
- [ ] Add data completeness dashboard/report (build-time or diagnostic): total records by type; dated/undated; invalid dates; missing IDs; missing source refs; duplicates and name anomalies.
- [ ] Write test cases for temporal uncertainty, cross-year boundaries, overlapping phases, repeated identities, nulls, project ceilings, range filtering and inconsistent API returns.
- [ ] Add integration tests using controlled GraphQL mock responses and browser E2E tests using deterministic fixtures.
- [ ] Run controlled live API smoke tests separately from fixture tests; do not make CI success depend on third-party uptime alone.
- [ ] Include security review: public-data confirmation, no credentials, no injection via returned labels/descriptions, safe link protocol allowlist, CORS and CSP compatibility.
- [ ] Produce research-methodology note: visualisation is an interface to available traces, not a complete history of DDR; absence is scoped to returned records and collection coverage.
- [ ] Review citation/provenance affordances with at least 10 varied sampled entities (periods, projects, student records and staff if present).
- [ ] Document all unresolved issues in a residual register with owner, severity, reproduction, source and mitigation.

## Non-negotiable historical invariants

```yaml
invariants:
  - no_project_start_date_inferred_from_duration_ceiling
  - no_student_enrolment_interval_inferred_from_single_year
  - no_staff_service_interval_inferred_from_name_appearance
  - no_person_identity_merge_on_display_name_alone
  - no_project_staff_student_relationship_without_supported_link
  - no_catalogue_association_claimed_as_participation_without_evidence
  - no_missing_source_claimed_to_be_historical_nonexistence
  - no_fabricated_document_pid_or_source_url
  - no_undated_record_silently_excluded_from_search_results
  - no_live_fixture_fallback_without_explicit_environment_notice
```

## Acceptance tests

- `S05-01` All invariants have explicit automated tests or documented manual verification.
- `S05-02` Source links displayed are valid, sourced, safe and traceable to API data where supplied.
- `S05-03` Data-quality report counts reconcile against fetched/fixture inputs; skipped rows are enumerated.
- `S05-04` E2E tests pass for timeline selection, filter/search, evidence inspection, empty/error cases and mobile.
- `S05-05` No high-severity accessibility/security/historical-integrity defects remain; lesser defects documented and accepted explicitly.
- `S05-06` Full QA receipt contains test command, commit SHA, environment, date, result, residuals and reviewer.

**Deliverables:** test suite, completeness report, methodology note, issues ledger, acceptance matrix and release candidate.  
**Exit:** **PASS** only with documented provenance and uncertainty handling.

---

# SOW-06 — GitHub Pages, dual-host integration and operational handover

**ID:** `SOW-06`  
**Objective:** Deploy one secure static application that both research sites consume, with reliable rollback and maintenance instructions.

## Required tasks

- [ ] Configure GitHub Actions to install (`npm ci`), verify, build and deploy Pages from a protected main branch.
- [ ] Choose a canonical origin: GitHub Pages URL initially, optionally `timeline.ddrarchive.org` with DNS/TLS configuration. Record exact decision; do not assume custom DNS exists.
- [ ] Verify Vite `base` for repository-path hosting versus root-domain hosting; verify all assets load directly and in an iframe.
- [ ] Account for single-page routing and deep links: prefer query-string state on the one route, or configure a Pages-compatible fallback if adding history routes.
- [ ] Check actual iframe embedding behaviour, including `frame-ancestors`/X-Frame-Options where applicable and host CSP `frame-src`/equivalent policies; GitHub Pages header control is limited, so test the deployed outcome.
- [ ] Integrate a responsive iframe in both `ddrarchive.org` and `innovationdesign.io`, preserving accessible title and an external open-in-new-tab link.
- [ ] Define optional `postMessage` v1 envelope and origin validation **only if required** for parent/child height, navigation or event communication.
- [ ] If dynamic height is needed, use `ResizeObserver` in child, throttled height messages and strict parent origin validation; avoid wild-card origins for sensitive communication.
- [ ] Store only public data in frontend; confirm all live GraphQL calls remain functional under actual Pages origin and both embedded contexts.
- [ ] Add production error/failure-state checks, release tagging, changelog, deployment checklist, rollback path and maintainer runbook.
- [ ] Run production smoke tests on both host sites, including mobile, keyboard, Safari/Chrome/Firefox where available, network failure and API degradation.
- [ ] Capture dated deployment evidence and final PASS/FAIL receipt.

## Proposed message contract (optional; not required for initial read-only iframe)

```json
{
  "channel": "ddr-timeline",
  "version": 1,
  "type": "TIMELINE_HEIGHT",
  "payload": { "height": 720 }
}
```

Validate `event.origin`, `event.source`, message shape and numeric bounds. For outbound messages, specify exact `targetOrigin` selected from verified/allowlisted parents. Do not use `postMessage` to provide credentials.

## Acceptance tests

- `S06-01` Tagged build deploys to Pages and loads all scripts/styles without path errors.
- `S06-02` The same release is embedded and functional in **both** host applications.
- `S06-03` Browser console and network panel show no CORS, frame-policy, mixed-content or critical runtime errors.
- `S06-04` One central deployment updates both embeds; no host-site rebuild required for timeline content/UI changes when iframe integration is unchanged.
- `S06-05` Parent/child navigation, focus, sizing and mobile behaviour verified.
- `S06-06` Deployment rollback to previously tagged release documented and rehearsed.
- `S06-07` Live API failure has honest user-visible handling, no fake-success fixture content.
- `S06-08` Operations documentation lists ownership, deployment steps, cache/freshness, incident triage and maintenance.

**Deliverables:** live Pages URL; working embeds on both domains; release artefacts; runbook; final acceptance/rollback evidence.  
**Exit:** **PASS** after real deployed-site verification (not local-only testing).

---

# 2. Global User Acceptance Test matrix

| ID | Scenario | Expected result | Priority |
|---|---|---|---|
| UAT-01 | Open timeline | 1965–1985 institutional overview loads | P0 |
| UAT-02 | Select Formation phase | Correct 1965–71 record and supplied description | P0 |
| UAT-03 | Select Peak productivity phase | Correct 1973–79 record; no invented detail | P0 |
| UAT-04 | Show enclosing DDR phase | Acts as date-domain context, not extra overlapping phase | P1 |
| UAT-05 | Find 1983 student | Marker displayed in 1983 only | P0 |
| UAT-06 | Filter students by DEU | Only supported DEU records shown | P1 |
| UAT-07 | Inspect student thesis | Supplied degree/title displayed; null not rendered as literal | P1 |
| UAT-08 | Search Job 171 | Title, funder, project lead and duration visible | P0 |
| UAT-09 | Locate Job 171 on chart without dates | Not positioned at invented date; accessible undated register | P0 |
| UAT-10 | Missing project lead | Clearly unknown, not string `Null` | P0 |
| UAT-11 | Year brush 1973–1979 | Dated records filtered, undated availability made explicit | P0 |
| UAT-12 | Reset viewport | Full domain restored without changing records | P1 |
| UAT-13 | Search record by name | Matching labels returned; unique records not collapsed | P1 |
| UAT-14 | Select related entity | Relationship shown only if supported by API evidence | P0 |
| UAT-15 | Keyboard-only exploration | All core actions accessible | P0 |
| UAT-16 | Narrow/mobile viewport | Usable responsive alternative to detailed canvas | P0 |
| UAT-17 | Share URL with selection | Valid selected state restored | P1 |
| UAT-18 | API unavailable | Visible, actionable error state; no fake dataset | P0 |
| UAT-19 | Unknown provenance | UI does not imply source verification | P0 |
| UAT-20 | Open on both host sites | Same production build functions in both | P0 |
| UAT-21 | Redeploy central app | Both embeds load updated release | P0 |
| UAT-22 | Accessibility contrast/reduced motion | Controls/marks remain legible and usable | P0 |
| UAT-23 | Dates outside 1965–1985 | Clamped or excluded with documented explanation | P1 |
| UAT-24 | Partial GraphQL response | Visible partial/error state and no unexplained missing categories | P0 |

**Priority policy:** P0 must PASS for release. P1 failures require an explicitly approved residual with mitigation and owner. No silent waivers.

# 3. Risk and decision register

| ID | Risk / open question | Decision or mitigation | Owner / phase |
|---|---|---|---|
| R-01 | Unknown GraphQL schema | Discover and document live contract; fail closed rather than invent queries | SOW-02 |
| R-02 | CORS prevents browser fetch | Verify from deployment origin early; approved architecture change needed if proxy required | SOW-02/06 |
| R-03 | Projects mostly lack absolute dates | Undated searchable register until authoritative dates provided | SOW-02/03 |
| R-04 | Staff schema/data not yet seen | Treat as integration dependency, not invented fixture | SOW-02 |
| R-05 | Period shorthand gives year precision only | Explicit year-level interpretation and uncertainty | SOW-02 |
| R-06 | Large numbers of labels overcrowd chart | Grouping, aggregation, virtualisation and list view | SOW-03 |
| R-07 | Public static JS exposes secrets | Only unauthenticated/public API usage; never bundle secrets | All |
| R-08 | iframe accessibility/sizing | Responsive wrapper; tested resizing or stable height; standalone fallback | SOW-06 |
| R-09 | Name duplication and spelling variants | Stable API identity / evidence-grounded relationships; flag anomalies | SOW-02/05 |
| R-10 | GraphQL API evolution | Adapter tests, contract tests, changelog, graceful errors | SOW-02/05 |
| R-11 | Historical overclaiming | Epistemic invariant suite and manual audit | SOW-05 |
| R-12 | Old Cooper Hewitt code dependencies | Design precedent only; modern D3 + React implementation | SOW-03 |

# 4. Change control

Any new requirement that alters hosting, introduces private data/authentication, adds a server/proxy/database, changes historical inference policy, expands the date range, or shifts from iframe to package/web-component integration must be entered as a change request, with rationale, architectural impact, security impact, regression tests and approval **before** implementation. Document approved deviations in `docs/architecture.md` and the work-package acceptance receipt.

# 5. Definition of Done — global

A release is **DONE** only when:

- [ ] All six work packages have approved PASS receipts.
- [ ] All P0 UAT cases pass on the deployed version.
- [ ] Every screen distinguishes documented time, approximate time and undated entities.
- [ ] No unsupported people–project–student relationships or dates are shown as facts.
- [ ] Both host sites embed the same centrally deployed application.
- [ ] No secrets are shipped; GraphQL CORS and policy checks pass in production.
- [ ] CI, unit/integration/E2E tests, accessibility review and documented smoke tests pass.
- [ ] README, data dictionary, API contract, methodology note and operations runbook exist.
- [ ] Live URL, source commit SHA, release tag, outstanding risks and rollback instructions are recorded.

## 5.1 Machine-readable acceptance receipt template

Store one file per SoW at `docs/acceptance/SOW-XX.yaml`:

```yaml
sow_id: SOW-01
status: NOT_STARTED # NOT_STARTED | IN_PROGRESS | PASS | FAIL | BLOCKED
release_commit: null
validated_at_utc: null
reviewer: null
checks:
  - id: S01-01
    status: NOT_RUN # NOT_RUN | PASS | FAIL | BLOCKED
    evidence_path: null
    notes: null
residuals: []
next_gate: SOW-02
```

Populate the actual checks for each SoW; do not mark a phase PASS unless evidence links/paths exist for every mandatory criterion.

# 6. Implementation order for coding assistant / VS Code

1. Read this document completely and treat historical invariants as hard constraints.
2. Execute **SOW-01 only**. Create the repo, tools, shell, docs and passing CI.
3. Present evidence and an acceptance receipt; **do not begin SOW-02 before SOW-01 passes**.
4. Execute **SOW-02** against the verified live schema. Resolve missing API/CORS/staff fields explicitly.
5. Execute SOW-03, then SOW-04, then SOW-05, then SOW-06, closing each gate independently.
6. Run the full UAT matrix after deployment; publish the resulting PASS/FAIL table and signed-off residual list.

# 7. Reference points

- Cooper Hewitt Labs, *A Timeline of Event Horizons* (2013): https://labs.cooperhewitt.org/2013/a-timeline-of-event-horizons/
- Cooper Hewitt historical D3 source: https://github.com/cooperhewitt/d3-timeline-event-horizon
- IBM Carbon Design System: https://carbondesignsystem.com/
- D3 documentation: https://d3js.org/
- React documentation: https://react.dev/
- Vite documentation: https://vite.dev/
- GraphQL: https://graphql.org/learn/
- GitHub Pages documentation: https://docs.github.com/en/pages
- Existing DDR API: https://api.ddrarchive.org/graphql

**Reference note:** URLs are architectural references. Recheck their availability and the live API's actual schema during execution; this SoW does not assert the GraphQL schema has been inspected or that the listed sources expose particular fields.

---

**END — DDR Timeline Master SoW v1.0**
