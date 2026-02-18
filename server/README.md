# FoodBridge Backend

Express.js REST API with Supabase integration.

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   - Get them from: Supabase Dashboard → Settings → API

3. Update `CLIENT_URL` if frontend runs on different port

## Running the Server

### Development (with auto-restart)
```bash
npm run dev
```

### Production
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account

### Food Listings (Provider)
- `POST /api/listings/create` - Create food listing
- `GET /api/listings/my-listings` - View own listings
- `GET /api/listings/available` - View available listings
- `PATCH /api/listings/:id/status` - Update listing status

### Tasks (Volunteer)
- `GET /api/tasks/nearby` - View nearby tasks (within radius)
- `POST /api/tasks/accept` - Accept a task
- `GET /api/tasks/my-tasks` - View assigned tasks
- `PATCH /api/tasks/:id/status` - Update task status

## Authentication

All protected routes require Bearer token in header:
```
Authorization: Bearer <supabase_jwt_token>
```

## Error Handling

All responses follow this format:
```json
{
  "success": true/false,
  "data": {...},
  "error": "error message"
}
```

## Deployment (Render)

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `cd server && npm install`
4. Start command: `cd server && npm start`
5. Add environment variables
6. Deploy!
