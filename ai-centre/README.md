# AI Centre — Vidyashilp Academy

Landing page **and** member ERP for the AI Centre student club, served by a small Express backend.

## Features

- **Landing page** — animated, responsive marketing site for the club.
- **Auth** — signup / login / logout with token sessions. The **first registered user becomes the admin**; everyone after is a member.
- **ERP dashboard** (`/dashboard.html`, behind login):
  - **Members** (admin) — view, change role, remove.
  - **Events / Sessions** — admins create; members view.
  - **Attendance** (admin) — mark who attended each event.
  - **Announcements** — admins post; members read.
  - **Messages** — members message admins; admins reply.

## Run locally

```bash
npm install
npm start
```

Then open **http://localhost:3000** and sign up — you'll be the admin. Click **Dashboard** to open the ERP.

## Tech

- Node.js + Express
- Vanilla HTML / CSS / JS (no build step)
- JSON files for storage (`users.json`, `events.json`, …)

## Notes / TODO

These are fine for a club/demo but should be hardened before any real deployment:

- Passwords are stored in plaintext in `users.json` → switch to `bcrypt` hashing.
- Sessions persist to `sessions.json` (survive restarts) but aren't expired → add expiry.
- Data files are git-ignored because they hold tokens/passwords.
