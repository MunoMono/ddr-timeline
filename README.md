# DDR Timeline

Accessible, read-only timeline for documented Department of Design Research material, with a stated scope of 1965-1985. The frontend is a static React application; the existing DDR GraphQL API remains the source of truth. No application server, database, or archival write path is part of this project.

## Requirements

- Node.js 24 LTS with npm
- Git and VS Code

In Windows PowerShell, `npm.cmd` avoids PowerShell execution-policy issues with the npm wrapper script.

```powershell
node --version
npm.cmd --version
npm.cmd ci
npm.cmd run dev
```

Vite prints the local URL. Stop the server with `Ctrl+C`.

## Checks

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
```

Playwright's Chromium browser is installed once per machine with:

```powershell
npx.cmd playwright install chromium
```

## Configuration

`.env.example` documents the public GraphQL endpoint. Copy it to `.env.local` when working on the data adapter. The initial shell intentionally does not call the endpoint or display fixtures; SOW-02 must verify schema, CORS, and browser access first.

Vite uses `/` for a custom-domain deployment. In Windows PowerShell, set the GitHub Pages repository base before building:

```powershell
$env:BASE_PATH = '/ddr-timeline/'
npm.cmd run build
Remove-Item Env:BASE_PATH
```

The configured base is also used for app links and generated assets.

## Deployment

Pushing to `main` runs CI and a GitHub Pages deployment workflow. The deployment build uses `/ddr-timeline/` as its base path. The expected project URL is `https://munomono.github.io/ddr-timeline/` after Pages is enabled for GitHub Actions in repository settings.

## Project notes

- [Architecture](docs/architecture.md) records system boundaries and integration assumptions.
- [ADR 0001](docs/adr/0001-static-frontend.md) explains the static frontend and no-backend decision.
- [Embed integration](docs/integration.md) defines the iframe-first direction and defers the message contract to SOW-06.
- [SOW-01 acceptance receipt](docs/acceptance/SOW-01.yaml) records validation evidence.

Follow the sequential gates in [the master SOW](docs/DDR_Timeline_Master_SoW_v1.0.md). Do not implement live schema assumptions before SOW-02 discovery.
