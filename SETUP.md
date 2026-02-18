# FoodBridge - Complete Setup Guide

## 🎯 Overview

This guide will help you set up the complete FoodBridge platform locally.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Git** (optional, for version control)

---

## 🗄️ Step 1: Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `foodbridge`
   - Database password: (save this!)
   - Region: Choose closest to you
4. Wait for project to be created

### 1.2 Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Open `database/schema.sql` from this project
3. Copy the entire content
4. Paste into SQL Editor and click **Run**
5. Verify tables are created: Go to **Table Editor**

### 1.3 Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

---

## 🔧 Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd server
npm install
```

### 2.2 Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 2.3 Start Backend Server

```bash
npm run dev
```

✅ Server should start on `http://localhost:5000`

Test it: Open browser and go to `http://localhost:5000/health`

You should see:
```json
{
  "success": true,
  "status": "healthy",
  ...
}
```

---

## 🎨 Step 3: Frontend Setup

### 3.1 Install Dependencies

Open a **new terminal** (keep backend running):

```bash
cd client
npm install
```

### 3.2 Configure Environment

```bash
# Copy example env file
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:5000
```

### 3.3 Start Frontend

```bash
npm run dev
```

✅ App should open automatically at `http://localhost:5173`

---

## 🧪 Step 4: Test the Application

### 4.1 Create a Provider Account

1. Click **Sign up here**
2. Fill in:
   - Name: `Test Hotel`
   - Email: `provider@test.com`
   - Password: `test123`
   - Role: **Provider**
   - Organization: `Test Restaurant`
3. Click **Create Account**
4. Check console - you'll see a verification email message
5. Go to **Supabase** → **Authentication** → **Users**
6. Find your user and click **Confirm Email**

### 4.2 Sign In

1. Go back to app
2. Click **Sign in here**
3. Login with:
   - Email: `provider@test.com`
   - Password: `test123`

✅ You should see the Provider Dashboard!

### 4.3 Create a Food Listing

1. Click **Create New Listing**
2. Fill in:
   - Title: `Fresh Cooked Meals`
   - Quantity: `10`
   - Food Type: `Cooked Meals`
   - Pickup Address: `123 Main St, Mumbai`
   - Pickup Start/End Time: (select future times)
3. Click **Create Listing**

✅ You should see success message and redirect!

### 4.4 Verify in Database

1. Go to **Supabase** → **Table Editor** → `food_listings`
2. You should see your listing!

---

## 📁 Project Structure

```
FoodBridge/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── config/        # Supabase & API config
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Route pages
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Express Backend
│   ├── config/           # Supabase config
│   ├── middleware/       # Auth & error handlers
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   ├── server.js         # Main server file
│   └── package.json
│
├── database/             # SQL schema
│   └── schema.sql
│
└── README.md
```

---

## 🚀 Available Features

### ✅ Implemented

- User authentication (signup/login)
- Role-based access control (Provider, Volunteer, Recipient)
- Provider: Create food listings
- Protected routes
- Role-based navigation

### 🚧 Next Steps (Extend as needed)

- Provider: View and manage listings
- Volunteer: Browse nearby tasks
- Volunteer: Accept and complete tasks
- Recipient: View incoming deliveries
- Location-based filtering
- Status tracking
- Audit logs

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Configure:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
5. Add environment variables (from .env.local)
6. Deploy!

### Backend (Render)

1. Go to [render.com](https://render.com)
2. Create **New Web Service**
3. Connect GitHub repository
4. Configure:
   - Name: `foodbridge-api`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables (from .env)
6. Deploy!

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify Supabase credentials in .env
- Run `npm install` again

### Frontend won't start
- Check if port 5173 is available
- Verify .env.local exists
- Clear node_modules: `rm -rf node_modules && npm install`

### Can't create listing
- Check browser console for errors
- Verify backend is running
- Check network tab for API response

### Authentication issues
- Verify Supabase URL and keys
- Check if user is confirmed in Supabase
- Clear browser localStorage

---

## 📞 Support

For issues or questions:
1. Check database schema is properly installed
2. Verify all environment variables
3. Check browser and server console logs
4. Review API responses in Network tab

---

## 📝 License

MIT License - Free for academic and commercial use.

---

**Congratulations! 🎉**  
You've successfully set up FoodBridge locally!
