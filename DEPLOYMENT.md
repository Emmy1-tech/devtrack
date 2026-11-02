# DevTrack deployment

## Live demo

**Public URL:** https://devtrack-emmy.emmy1-tech.workers.dev/

The DevTrack portfolio demo is deployed on **Cloudflare Workers**. The public demo serves the responsive web interface and a same-origin API; anonymous session workspaces are stored in **Cloudflare D1**. Visitors can open the site from a phone or computer without installing anything.

**Verified smoke checks (November 1, 2026):** the live homepage loads, `GET /api/health` and `GET /api/workspace` respond successfully, and an example workspace update can be saved, reloaded, and reset. These checks do not replace a comprehensive production security review.

## Important source and hosting distinction

The files in this GitHub repository implement the local version of DevTrack with a **Node.js HTTP server and per-session JSON files**. The currently deployed Cloudflare Worker is an adapted hosted implementation using **D1 storage**. The Cloudflare Worker deployment source and configuration are **not yet synchronized into this repository**, so this repository alone cannot reproduce the current Cloudflare deployment. A future improvement is to version the Cloudflare Worker source, D1 schema/migrations, and CI deployment configuration alongside the application.

## Local Node.js alternative

The repository also includes `render.yaml` as an **optional** starting point for a Node.js deployment on Render. This configuration is **not** the source of the current live Cloudflare demo.

To evaluate a separate Render deployment:

1. Review the source, tests, and current hosting limitations.
2. Run `npm run check && npm test`.
3. Configure the Node.js service to run `npm start`, with the hosting platform providing `PORT`.
4. Verify `/api/health` and the main project/task flows.
5. Provide durable storage before relying on saved data across server restarts.

Do **not** replace the existing live Cloudflare deployment without an intentional migration and verification.

## Persistence, access, and operational limitations

- Cloudflare D1 keeps separate anonymous demo workspaces, but these are **not authenticated user accounts**, and indefinite retention is not guaranteed.
- Visitors should use sample or throwaway data only.
- The optional local Node.js version stores session JSON files; ephemeral Node hosts may lose that data on restart.
- Cloudflare free-tier request/database limits can affect availability if exceeded.
- Rate limits, backups, accounts, and production monitoring require further work.

See [README.md](README.md), [SECURITY.md](SECURITY.md), and [docs/API.md](docs/API.md).
