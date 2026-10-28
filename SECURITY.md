# DevTrack: security and limitations

This application is a public portfolio **demonstration**. Do not enter sensitive personal or business information.

## Protections implemented

- 160-bit random identifiers in HttpOnly, SameSite=Lax cookies; Secure is set for HTTPS requests.
- Cookie values are checked against a strict hexadecimal pattern before being used as filenames.
- Separate JSON files by anonymous session (not by authenticated account).
- Validation of project/task fields, enumerated statuses and priorities, dates, project IDs, payload sizes and workspace limits.
- Basic same-origin checking for requests carrying an Origin header, and no permissive CORS response.
- Baseline Content Security Policy, no-framing, no-sniff and referrer headers.
- Per-session serialized writes and atomic file rename within one Node process.

## Not implemented

- Named user accounts, logins or authorization policies.
- A complete CSRF token strategy. SameSite and Origin checks are only a baseline.
- A strict CSP without inline scripts and styles.
- Managed storage, cross-process write locking, backups, retention/deletion policies, or guaranteed persistence across deployments.
- Distributed rate limiting, production monitoring, privacy/legal review, or security audit.
- Concurrent-tab optimistic locking; the workspace editor uses last-write-wins snapshot saves.

Anonymous session cookies are bearer credentials for the demo data. Anyone who gets a cookie may access that browser session. Free hosting instances may delete their filesystem on restart.

To report a vulnerability, use private GitHub vulnerability reporting if available. Never post security tokens or session cookies in a public issue.
