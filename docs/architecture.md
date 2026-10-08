# Architecture

## Runtime boundary

The deliverable is one static React + TypeScript application built by Vite. It is deployed independently and is intended to be embedded by both host sites using responsive iframes. The existing public GraphQL endpoint is the only planned source of archival records. There is no application-specific server, database, write path, or production fixture fallback.

```text
Existing DDR GraphQL API
          |
          | read-only browser requests, after SOW-02 verification
          v
React + TypeScript + Carbon shell
          |-- adapters and domain model (SOW-02)
          |-- D3 geometry (SOW-03)
          |-- GitHub Pages build (SOW-06)
          v
Responsive iframe in each host site (SOW-06)
```

## Current boundary

SOW-01 establishes the UI, build, test, and deployment-base foundations only. The app does not issue a GraphQL request. The endpoint URL is configuration, not evidence of a usable schema, CORS policy, authentication policy, or browser response. Those checks and the typed adapter are SOW-02 work.

The displayed years communicate only the documented project envelope. Projects without explicit dates, student-year events, and undated staff records must not be assigned invented intervals. Provenance and temporal precision belong to each normalized record when the data contract is established.

## Frontend ownership

- React owns semantic structure, state, and accessible interactions.
- Carbon React and Carbon design tokens provide the shell and controls.
- D3 will own SVG geometry only; it must not mutate DOM nodes owned by React.
- Browser state is ephemeral. No client-side persistence or analytics is configured.
- Static fixtures are reserved for tests and offline development, never an implicit production substitute.

## Hosting and embedding

`BASE_PATH` selects Vite's public base: `/` for a root/custom domain or `/ddr-timeline/` for the repository path. Both host sites should embed the same deployment. Iframe sizing, allowed origins, and any versioned `postMessage` contract are specified in [integration.md](integration.md) and implemented in SOW-06.