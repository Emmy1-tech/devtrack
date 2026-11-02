# DevTrack

**A focused developer workspace for planning projects, tracking tasks, and seeing progress clearly.**

### [Open the Live DevTrack Demo](https://devtrack-emmy.emmy1-tech.workers.dev/)

[Live demo](https://devtrack-emmy.emmy1-tech.workers.dev/) · [API documentation](docs/API.md) · [Deployment guide](DEPLOYMENT.md) · [Security & limitations](SECURITY.md) · [GitHub profile](https://github.com/Emmy1-tech)

**Built and maintained by [Emmy1-tech](https://github.com/Emmy1-tech).**

DevTrack is a responsive project-management dashboard with project and task tracking, upcoming deadlines, activity, calendar views, and progress summaries. The **live demo opens in a regular browser**, so recruiters and visitors can try it on a laptop, tablet, or phone without installing anything.

> **Demo notice:** DevTrack includes example projects and uses anonymous browser sessions, not user accounts. Each visitor gets a separate demo workspace. Please do not enter private or sensitive information. This is a portfolio demonstration, not a production collaboration service.

## Explore the live application

**[Launch DevTrack →](https://devtrack-emmy.emmy1-tech.workers.dev/)**

In the hosted demo, you can:

- Explore the responsive dashboard, project overview, and activity views.
- Create and manage projects with descriptions, statuses, and target dates.
- Add, update, complete, and remove tasks, with priorities and due dates.
- Search and filter projects and track completion percentages based on task status.
- Use the weekly calendar and export task details as CSV.
- Refresh the page and revisit your workspace in the same browser session while its demo session remains available.

The hosted site uses **Cloudflare Workers** for the web/API layer and **Cloudflare D1** to store anonymous demo workspaces. The local development version in this repository uses a **Node.js HTTP server** and session-scoped JSON files.

## Technology

| Area | Implementation |
| --- | --- |
| Interface | HTML, CSS, vanilla JavaScript |
| Local server and API | Node.js 20+ built-in HTTP server (`server.js`) |
| Public demo hosting | Cloudflare Workers |
| Hosted demo persistence | Cloudflare D1 (SQLite-based) |
| Local persistence | Per-session JSON files |
| Testing | Node.js built-in test runner and HTTP integration tests |
| CI | GitHub Actions on Node.js 20 and 22 |

**Deployment note:** The repository contains the local Node.js implementation. The live Cloudflare Worker is an adaptation of that app for hosted execution and D1 storage; its Cloudflare-specific deployment source is not yet maintained in this repository. The hosted link above is the verified live demo.

## Architecture

The browser loads the dashboard and calls same-origin API endpoints such as `/api/workspace`, `/api/projects`, `/api/tasks`, and `/api/stats`. The API validates updates, calculates project progress, and keeps each anonymous visitor's demo workspace separate.

- **On Cloudflare:** Worker-hosted application and API → D1 workspace storage.
- **Locally:** Node.js HTTP server → session-based JSON workspace storage.

See [the API reference](docs/API.md) for supported endpoints, request examples, and validation rules.

## Development and tests

The **live demo requires no setup**. Developers who want to run the source locally can follow [LOCAL-SETUP.md](LOCAL-SETUP.md).

Requirements: Node.js 20 or newer. This project has no third-party runtime dependencies.

```bash
npm start
```

Run the checks and integration tests:

```bash
npm run check
npm test
```

## Repository structure

```text
public/index.html          Responsive dashboard interface
server.js                  Local Node.js API and session storage
tests/api.test.js          API integration tests
docs/API.md                API contract and examples
.github/workflows/ci.yml   Automated quality checks
DEPLOYMENT.md              Hosted demo and deployment notes
SECURITY.md                Security considerations and known limitations
LOCAL-SETUP.md             Local development instructions
render.yaml                Optional Node.js/Render configuration
```

## Limitations and future work

This is a **portfolio demo**, not an authenticated multi-user platform. There are no user accounts, roles, or team sharing features. Simultaneous edits from multiple tabs may overwrite one another, and there is no guarantee of indefinite retention of anonymous demo data. Additional work would include authentication, conflict detection, stronger security controls, automated deployment from source, persistent user-owned projects, and production monitoring.

See [SECURITY.md](SECURITY.md) for further details.

**Project:** [DevTrack](https://github.com/Emmy1-tech/devtrack) · **Live demo:** [devtrack-emmy.emmy1-tech.workers.dev](https://devtrack-emmy.emmy1-tech.workers.dev/)

Created and maintained by Emmy1-tech. Licensed under the [MIT License](LICENSE).
