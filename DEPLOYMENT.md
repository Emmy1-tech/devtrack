# Deploy DevTrack

The repository provides a `render.yaml` configuration for an example Render web service. **No hosted URL has been deployed or verified in this update.**

1. Review and merge the full-stack development pull request after CI passes.
2. In Render, create a Node web service from this repository or import its Blueprint.
3. Use `npm run check && npm test` as the build command and `npm start` as the start command.
4. Let the hosting platform set `PORT`, and set `NODE_ENV=production`.
5. Verify the actual service URL, `/api/health`, the dashboard, task creation, refreshing a page, and deleting a test task.
6. Only then add the confirmed live URL to the README and portfolio.

**Persistence:** the JSON files are written to an instance-local folder. Ephemeral or free hosting may discard them on restart, so DevTrack is not a reliable place for important projects. For a real application, use authenticated accounts and a managed relational database with backups and data ownership rules. See [SECURITY.md](SECURITY.md).
