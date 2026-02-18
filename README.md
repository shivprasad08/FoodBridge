# FoodBridge - Food Surplus Management Platform

A 24/7 reverse-logistics platform connecting food providers, volunteers, and NGOs to reduce food waste.

## 🏗️ Project Structure

```
FoodBridge/
├── client/          # React Frontend (Vite + Tailwind)
├── server/          # Express Backend (Node.js)
├── database/        # SQL Schema & Migration Scripts
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Supabase Account
- Google Maps API Key (optional for production)

### 1. Database Setup
```bash
# Run SQL scripts in Supabase SQL Editor
# See database/schema.sql
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure .env with Supabase credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env.local
# Configure .env.local with API URLs
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `PORT` - Server port (default: 5000)

### Frontend (.env.local)
- `VITE_API_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## 👥 User Roles

- **Provider**: Posts surplus food listings
- **Volunteer**: Accepts & delivers tasks
- **Recipient**: Confirms food receipt

## 📦 Tech Stack

**Frontend**: React, Vite, Tailwind CSS, Axios, Lucide Icons  
**Backend**: Node.js, Express, Supabase JS Client  
**Database**: PostgreSQL (via Supabase)  
**Deployment**: Vercel (Frontend) + Render (Backend)

## 🎯 Core Features

1. ✅ Role-based authentication
2. ✅ Food listing management
3. ✅ Location-based task matching
4. ✅ Status-driven workflow
5. ✅ Audit logging

## 📝 License

MIT License - TY B.Tech Software Engineering Project
