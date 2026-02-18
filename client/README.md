# FoodBridge Client

React frontend for the FoodBridge platform.

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update environment variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `VITE_API_URL` - Backend API URL (http://localhost:5000 for local dev)

## Development

```bash
npm run dev
```

App will run on `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

## Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Framework Preset: Vite
3. Build Command: `cd client && npm install && npm run build`
4. Output Directory: `client/dist`
5. Add environment variables
6. Deploy!

## Features Implemented

✅ Authentication (Login/Signup)  
✅ Role-based navigation  
✅ Provider: Create food listings  
✅ Dashboard for all roles  
✅ Protected routes  

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Supabase JS Client
- Lucide Icons
