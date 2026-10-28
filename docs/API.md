# DevTrack API

The app and API are served from the same origin. API requests use an HttpOnly, SameSite=Lax anonymous session cookie. This is a demo session, not an account. Except for CSV export, requests and responses use JSON. Errors return `{ "error": "message" }`.

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/api/health` | Basic health and storage status |
| GET | `/api/workspace` | Sample/session projects, tasks, profile, activity and revision |
| PUT | `/api/workspace` | Validate and save a complete workspace snapshot |
| GET | `/api/projects` | Projects with computed progress |
| POST | `/api/projects` | Add a project |
| PATCH | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project and its tasks |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Add a task |
| PATCH | `/api/tasks/:id` | Update task properties |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/activity` | Activity events |
| GET | `/api/stats` | Task counts and near-term due dates |
| GET | `/api/export.csv` | Download task CSV |
| POST | `/api/reset` | Reset this session to sample data |

To create a project:

```http
POST /api/projects
Content-Type: application/json

{"name":"Portfolio","description":"Polish the website","status":"Planning","due":"2026-11-20"}
```

To create a task, first obtain a valid project ID from `GET /api/projects`:

```http
POST /api/tasks
Content-Type: application/json

{"title":"Test the contact form","projectId":"1","priority":"High","status":"Todo","due":"2026-11-03"}
```

Allowed project statuses: `Planning`, `In progress`, `Completed`. Task statuses: `Todo`, `In progress`, `Done`. Priorities: `Low`, `Medium`, `High`. Task references must point to an existing project in the same session. Names, statuses, dates and description lengths are validated. Maximums are 200 projects, 2,000 tasks and a 300 KB request body.

Project progress is **computed from tasks**, not accepted as a direct edit. PUT replaces the workspace snapshot and should only be used by one tab at a time; it does not implement conflict detection.
