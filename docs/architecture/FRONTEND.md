# DDR Timeline — Frontend architecture

## Status and contract

The application is a read-only public visualisation of the DDR employment dataset. The display window is **1965–1985**; the record's start and end dates are never rewritten to fit the window. Missing tenure dates are not assigned invented values. Co-presence from overlapping tenures is not evidence of collaboration.

## Component tree

```text
src/
├── App.tsx                         # composition and filter state only
├── models/employment.ts            # typed staff model, calendar boundaries, role families
├── hooks/
│   ├── useEmployment.ts            # GraphQL-first fetch and archival snapshot fallback
│   └── useTimelineZoom.ts          # isolated D3 zoom controller
├── components/
│   ├── Header/TimelineHeader.tsx
│   ├── Staff/
│   │   ├── StaffFilters.tsx
│   │   └── StaffDetails.tsx
│   ├── Timeline/
│   │   ├── TimelineCanvas.tsx
│   │   ├── TimelineControls.tsx
│   │   └── TimelineOverview.tsx
│   └── styles/
│       ├── index.scss              # single Sass entrypoint
│       ├── _tokens.scss            # Carbon G90 and chart category tokens
│       ├── _typography.scss        # Carbon v11 Sass mixins / IBM Plex
│       └── _timeline.scss          # visualisation and layout presentation
└── main.tsx
```

## Governance

- **Carbon 11**: use `@carbon/react` for controls and `@carbon/styles/scss` for tokens / typography. IBM Plex Sans is the interface typeface; Plex Mono is used for code, dates, and metadata.
- **Styling**: do not add `style={{ ... }}` props or standalone `.css` files. SCSS is centralised under `src/components/styles`. SVG geometric attributes (`x`, `y`, `width`, `height`, `fill`) are data-encoded chart marks, not inline CSS. Document unavoidable exceptions before introducing them.
- **React**: handles state and DOM ownership. Keep data-loading in hooks and domain logic in models. D3 is used for scales and controlled zoom interactions.
- **Source integrity**: raw GraphQL response is the source of truth when available; labelled researcher-provided JSON is a transparent offline fallback. Never claim exact dates of promotion from multi-stage job titles.
- **Growth**: create new dataset adapters and timeline mark components for projects, students and institutional periods. Share zoom controls, SCSS design tokens and core date boundaries rather than copying screens.
- **Quality gates**: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`. Pages workflow independently checks public HTML, JS and archival dataset.

## Known improvement backlog

The timeline canvas still owns the SVG mark-rendering and overlap lane-packing algorithm. Before adding multiple data types, extract lane packing into a domain utility, adopt record-type adapters, add keyboard timeline navigation, and extend browser accessibility testing. Sass selectors for earlier prototype layouts remain in `_timeline.scss` and can be pruned gradually; do not treat the prototype's legacy selectors as a preferred styling pattern.
