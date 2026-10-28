# Local development (Windows)

1. Install Node.js 20 or newer.
2. Download the repository ZIP and extract it.
3. Open PowerShell in the DevTrack folder and run `npm start`, or double-click `start-local.bat`.
4. Visit **http://localhost:1295** while the server remains running.
5. Check **http://localhost:1295/api/health** if the workspace does not load.

Run `npm run check` and `npm test` for validation. Stop the server with Ctrl+C. To change the port in PowerShell: `$env:PORT=3001; npm start`. No dependency installation is required.
