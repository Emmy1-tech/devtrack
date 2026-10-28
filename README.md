# DevTrack

**A developer workspace for turning plans into finished work.**

[Repository](https://github.com/Emmy1-tech/devtrack) · [API reference](docs/API.md) · [Deployment guide](DEPLOYMENT.md) · [Security](SECURITY.md)

Built by **[Emmy1-tech](https://github.com/Emmy1-tech)**. DevTrack began as an idea for a calmer place to manage software projects without losing sight of the small steps. It brings together project tracking, tasks, deadlines, a calendar, and activity in one responsive interface.

> **Demo notice:** the starting projects and activity are examples, not real team data. DevTrack has anonymous browser sessions, not accounts, secure team collaboration, or durable hosted storage. Please use throwaway information only.

## Try DevTrack

**Hosted demo:** Not deployed or verified yet. A real URL will be added after a successful deployment and smoke test.

**Local test:** After installing Node.js 20+, download this repository and run:

```bash
npm start
```

Then open **http://localhost:1295**. No `npm install` required: the backend uses only built-in Node.js modules. On Windows you may also double-click `start-local.bat`.

Run the tests:

```bash
npm run check
npm test
```

## Features

- Responsive landing page and developer dashboard.
- Project creation, search, status filters, target dates, and calculated task completion percentages.
- Task creation, completion/reopening, priorities, due dates and simple task views.
- Weekly calendar and activity timeline for planning.
- Project-summary CSV export and profile display settings.
- JSON API for workspaces, projects, tasks, activity, basic stats and CSV export.
- Anonymous browser sessions with server-side JSON persistence and per-session queued writes.
- Input validation, same-origin checking, security headers, baseline CSP, and automated integration tests.
- CI checks for Node.js 20 and 22.

## Architecture

```text
Browser (public/index.html)
        |
        | fetch /api/workspace
        v
Node.js server (server.js)
        |
        | validate + serialize session updates
        v
data/sessions/<random-session-id>.json (ignored by Git)
```

| Area | Technology |
| --- | --- |
| Interface | HTML, CSS, vanilla JavaScript |
| Backend | Node.js 20+ built-in HTTP server |
| Storage | Session-scoped local JSON files |
| Tests | Node built-in `node:test` |
| Automation | GitHub Actions CI on Node 20 and 22 |
| Hosting | Render-compatible `render.yaml` |

## Repository files

```text
.github/workflows/ci.yml   Automated checks
public/index.html          Responsive interface
server.js                  Node.js API, sessions, storage
tests/api.test.js          HTTP integration tests
docs/API.md                API contract
README.md                  Project guide
SECURITY.md                Limitations and safeguards
DEPLOYMENT.md              Deployment instructions
LOCAL-SETUP.md             Windows/local troubleshooting
render.yaml                Optional Render service config
start-local.bat            Windows launcher
```

## Limits and roadmap

DevTrack is a **portfolio project, not a production multi-user service**. The current interface uses snapshot saves to the API: simultaneous edits across browser tabs may overwrite each other. Anonymous sessions are not user authentication. The JSON store is only appropriate for a single Node process; hosting restarts may remove data.

Next steps include a managed database and migrations, authenticated users, per-user authorization, a stronger CSRF strategy, a stricter CSP without inline scripts/styles, better accessibility tests, true task history, and production monitoring.

Created and maintained by Emmy1-tech. Licensed under MIT; see [LICENSE](LICENSE).
