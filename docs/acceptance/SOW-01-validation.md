# SOW-01 Validation Evidence

**Validated:** 2026-10-08 10:02 UTC
**Environment:** Windows PowerShell 5.1, Node.js 24.21.0, npm 11.19.0, Vite 8.3.3, Playwright Chromium 156.0.8078.4

## Checks

| Check | Result | Evidence |
|---|---|---|
| `npm ci` | PASS; 375 packages installed, 0 vulnerabilities reported | `package-lock.json` |
| `npm run format:check` | PASS | Final local run |
| `npm run lint` | PASS | Final local run |
| `npm run typecheck` | PASS | Final local run |
| `npm test -- --reporter=dot` | PASS; 1 test | `tests/App.test.tsx` |
| `npm run build` | PASS; 917 modules transformed | Production bundle |
| `npm run test:e2e` | PASS; 1 Chromium test | Desktop and 375x812 mobile; no horizontal overflow or page errors |
| GitHub Pages subpath build | PASS; emitted asset URLs use `/ddr-timeline/assets/` | Build with `BASE_PATH=/ddr-timeline/` |
| GitHub Actions CI, run 1 | PASS | [Workflow run](https://github.com/MunoMono/ddr-timeline/actions/runs/37761691067) |
| GitHub Pages deployment, run 1 | BLOCKED | Pages site was not enabled when `configure-pages` ran; retry after source selection |

Screenshots: [desktop](SOW-01-desktop.png) and [mobile](SOW-01-mobile.png).

## Notes and residuals

- GitHub Actions is configured in `.github/workflows/ci.yml`, but a hosted run cannot be observed until the branch is pushed. The overall SOW-01 receipt remains `IN_PROGRESS` for that reason.
- `npm ci` completes successfully with npm 11's install-script approval behavior. npm reports unapproved IBM Carbon telemetry scripts and skips them; the app build and tests pass without those optional scripts.
- The lockfile overrides `@ibm/plex` to 6.4.0 because 6.4.1's postinstall invokes an unavailable `ibmtelemetry` command. Revisit the override when the upstream package fixes its install hook.
- Live GraphQL schema, CORS, and browser access were intentionally not tested; those are SOW-02 gates. This shell does not call the endpoint or display fixture records.
- This is a responsive smoke check, not a completed WCAG 2.2 AA audit.
