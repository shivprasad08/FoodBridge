# FoodBridge

FoodBridge is a role-based food redistribution platform that connects food providers with verified recipient NGOs to reduce waste and improve food access.

## What This Project Does

- Lets providers post surplus food listings with quantity, expiry, pickup address, and optional photo.
- Matches nearby recipients and sends notifications.
- Tracks pickup lifecycle from listing creation to delivery/confirmation.
- Provides dedicated dashboards for:
  - Provider
  - Recipient
  - Admin
- Supports real-time updates for listings/tasks/notifications.

## Core Features

### Provider
- Post food listings with map-based pickup location.
- View and manage active/past listings.
- Track task lifecycle in detail view.
- Edit profile and change password.

### Recipient
- Browse available food listings.
- Claim and track pickups.
- View pickup and delivery history.
- Manage recipient profile details.

### Admin
- View platform stats and user/listing metrics.
- Monitor operations dashboards.
- Track map-based activity views.

### Platform
- JWT-based authentication and role-based route protection.
- Realtime subscription hooks for live data updates.
- Notification feed and unread state handling.
- Upload support for listing images.

## Tech Stack

### Frontend
- React + Vite
- React Router
- Tailwind CSS
- Lucide icons
- MapLibre GL (OpenStreetMap tiles)

### Backend
- Node.js + Express
- PostgreSQL (Neon)
- pg client
- JWT (jsonwebtoken)
- bcryptjs
- multer (uploads)
- node-cron (background jobs)

## Project Structure

- `client/` - React frontend
- `server/` - Express API + DB schema initialization + jobs
- `common/` - shared utilities/constants (if used)
- `neon/` - edge/job-related function assets

## Environment Variables

Create environment files before running locally.

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_NEON_URL=YOUR_NEON_OR_AUTH_PROVIDER_URL
VITE_NEON_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

### `server/.env`

```env
PORT=3001
NEON_DATABASE_URL=postgres://...
# or DATABASE_URL=postgres://...

JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
ADMIN_SIGNUP_KEY=optional-admin-code

# optional: comma-separated origins
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Local Development

Install dependencies from root and run client/server in separate terminals.

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### Run frontend

```bash
npm run dev:client
```

### Run backend

```bash
npm run dev:server
```

Frontend default: `http://localhost:5173`  
Backend default: `http://localhost:3001`

## Build and Verify

### Build frontend

```bash
npm run build
```

### Full verify (frontend build + backend route/service check)

```bash
npm run verify
```

## API Surface (High Level)

- `/api/auth` - signup, login, me, profile update, password update
- `/api/listings` - create/list/detail/cancel/stats
- `/api/tasks` - task lifecycle actions
- `/api/notifications` - user notifications
- `/api/uploads` - food photo uploads
- `/api/admin` - admin metrics/management endpoints
- `/api/health` - health check

## Notes

- DB tables are initialized automatically on server startup.
- If DB env vars are missing, auth and DB-backed flows will fail.
- Map rendering uses OpenStreetMap tiles and can depend on network availability.


