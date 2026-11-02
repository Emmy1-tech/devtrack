# DevTrack security and limitations

DevTrack is a **public portfolio demonstration**. Do not store secrets, credentials, sensitive personal information, or confidential business data in it.

## Deployment models

- **Public demo:** Cloudflare Worker with Cloudflare D1 persistence for anonymous browser sessions.
- **Local Node.js app:** Session-scoped JSON files in the `data/` folder. These files are not intended for shared production hosting.
- Neither version implements authenticated user accounts, roles, or real team collaboration.

## Protections implemented

The local application and hosted adaptation include these baseline safeguards:

- Random 160-bit anonymous session IDs, stored in HttpOnly, SameSite=Lax cookies; the hosted HTTPS version sets Secure.
- Validation of project and task fields, statuses, priorities, dates, associations, payload sizes, and workspace limits.
- Same-origin checking on requests that provide an Origin header; no intentionally permissive cross-origin API.
- Basic response security headers, including content-type no-sniff, framing restrictions, referrer policy, and baseline Content Security Policy.
- Separate workspaces by anonymous browser session.
- The local Node server serializes same-session writes and uses atomic file replacement; the live hosted version uses D1.

These safeguards are **not** a substitute for a complete security audit.

## Limitations

- No sign-in, permissions model, team sharing, or strong user identity.
- Anonymous session cookies act as bearer credentials for that session's demo data.
- No complete CSRF-token protection; Origin and SameSite checks are baseline defenses only.
- Content Security Policy currently permits inline scripts/styles.
- No full rate-limiting, abuse prevention, independent penetration testing, or privacy/legal review.
- Snapshot updates use last-write-wins behavior; editing in multiple tabs can overwrite changes.
- No guaranteed backup, retention schedule, deletion workflow, or indefinite storage promise for hosted D1 workspaces.
- Local Node JSON persistence should not be used as durable storage on ephemeral free hosts.
- Cloudflare free-tier quotas can limit availability under heavier usage.
- The Cloudflare-specific deployed Worker source is not yet versioned in this repository. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Security reports

Use GitHub's private vulnerability reporting where available. Do not include session cookies, passwords, API tokens, or private customer data in a public issue.

See the [live demo](https://devtrack-emmy.emmy1-tech.workers.dev/) and [README](README.md).
