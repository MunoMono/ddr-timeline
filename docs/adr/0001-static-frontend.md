# ADR 0001: Keep the timeline frontend static

- Status: Accepted for SOW-01; revisit only through a documented architecture change.
- Date: 2026-10-08

## Context

The DDR archive already exposes a public GraphQL endpoint. The timeline is read-only, has no app-owned records, and is intended to be hosted once and embedded by two independent sites. The API schema, browser CORS behavior, and access policy still require verification.

## Decision

Build a React + TypeScript application as static assets and deploy them to GitHub Pages. Query the existing API directly only after SOW-02 proves that browser access is permitted and records the schema contract. Do not add an application server, database, proxy, or privileged token as a workaround for an unverified endpoint.

## Consequences

- One deployment can serve both host sites and can be rolled back independently of either host.
- The browser contains no privileged secrets and the app has no archival write path.
- CORS, API availability, rate limits, and public schema compatibility remain release gates.
- If direct browser access is disallowed, stop and record an architecture change request; do not silently introduce a proxy.
- The UI must show explicit empty/error states and must not silently substitute fixtures for missing live data.

## Revisit when

API policy or browser access cannot support the approved direct-read architecture, or a documented requirement adds authenticated or server-only behavior.