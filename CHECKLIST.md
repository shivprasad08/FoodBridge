# FoodBridge - Setup Checklist

Use this checklist to ensure everything is properly configured.

---

## ☑️ Prerequisites

- [ ] Node.js (v18+) installed
- [ ] npm installed
- [ ] Supabase account created
- [ ] Git installed (optional)

---

## ☑️ Database Setup

- [ ] Supabase project created
- [ ] Database password saved
- [ ] `database/schema.sql` executed in SQL Editor
- [ ] All 4 tables created (users, food_listings, tasks, audit_logs)
- [ ] RLS policies enabled
- [ ] Supabase URL copied
- [ ] Supabase anon key copied
- [ ] Supabase service role key copied

**Verify:** Go to Supabase Table Editor - you should see all 4 tables

---

## ☑️ Backend Setup

- [ ] Navigated to `server/` folder
- [ ] Ran `npm install`
- [ ] Copied `.env.example` to `.env`
- [ ] Updated `SUPABASE_URL` in `.env`
- [ ] Updated `SUPABASE_ANON_KEY` in `.env`
- [ ] Updated `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- [ ] Started server with `npm run dev`
- [ ] Server running on http://localhost:5000
- [ ] Health check working: http://localhost:5000/health

**Verify:** Open browser, visit http://localhost:5000/health  
Should see: `{"success": true, "status": "healthy", ...}`

---

## ☑️ Frontend Setup

- [ ] Navigated to `client/` folder (in new terminal)
- [ ] Ran `npm install`
- [ ] Copied `.env.example` to `.env.local`
- [ ] Updated `VITE_SUPABASE_URL` in `.env.local`
- [ ] Updated `VITE_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Updated `VITE_API_URL` (should be http://localhost:5000)
- [ ] Started frontend with `npm run dev`
- [ ] App opened at http://localhost:5173
- [ ] Login page displayed correctly

**Verify:** Should see FoodBridge logo and login form

---

## ☑️ Testing User Flow

### Create Provider Account
- [ ] Clicked "Sign up here"
- [ ] Filled in all fields
- [ ] Selected "Provider" role
- [ ] Clicked "Create Account"
- [ ] Saw success message
- [ ] Went to Supabase → Authentication → Users
- [ ] Found new user
- [ ] Clicked "Confirm Email"

**Verify:** User appears in Supabase Auth with confirmed status

---

### Login as Provider
- [ ] Went to Login page
- [ ] Entered test credentials
- [ ] Clicked "Sign In"
- [ ] Redirected to Dashboard
- [ ] Saw "Provider Dashboard"
- [ ] Navbar shows provider links

**Verify:** Dashboard shows welcome message with your name

---

### Create Food Listing
- [ ] Clicked "Create New Listing" in navbar
- [ ] Filled in:
  - Title: "Test Listing"
  - Quantity: 10
  - Food Type: Cooked Meals
  - Pickup Address: "123 Test Street"
  - Pickup times: (future dates)
- [ ] Clicked "Create Listing"
- [ ] Saw success message
- [ ] Redirected to My Listings

**Verify:** 
1. Success message appeared
2. Go to Supabase → Table Editor → food_listings
3. New listing appears with status "Available"

---

### Verify API Call
- [ ] Opened browser DevTools (F12)
- [ ] Went to Network tab
- [ ] Created another listing
- [ ] Saw POST request to `/api/listings/create`
- [ ] Response status: 201
- [ ] Response contains listing data

**Verify:** Network tab shows successful API call

---

## ☑️ Additional Checks

### Backend
- [ ] No errors in server terminal
- [ ] Request logs appearing in terminal
- [ ] All routes responding correctly

### Frontend
- [ ] No errors in browser console
- [ ] No warnings in browser console (minor React warnings OK)
- [ ] Tailwind styles loading correctly
- [ ] Icons (Lucide) displaying
- [ ] Navbar changes based on role
- [ ] Protected routes working

### Database
- [ ] Users table has your test user
- [ ] Food_listings table has test listing
- [ ] Audit_logs table has creation log
- [ ] All foreign keys working

---

## ☑️ Optional: Create Other Role Accounts

### Volunteer Account
- [ ] Signed out
- [ ] Created new account with "Volunteer" role
- [ ] Logged in
- [ ] Saw "Volunteer Dashboard"
- [ ] Navbar shows volunteer-specific links

### Recipient Account
- [ ] Signed out
- [ ] Created new account with "Recipient" role
- [ ] Logged in
- [ ] Saw "Recipient Dashboard"
- [ ] Navbar shows recipient-specific links

---

## ☑️ File Structure Verification

```
✓ FoodBridge/
  ✓ client/
    ✓ src/
      ✓ components/
      ✓ config/
      ✓ context/
      ✓ pages/
    ✓ package.json
    ✓ .env.local (created by you)
  ✓ server/
    ✓ config/
    ✓ middleware/
    ✓ routes/
    ✓ utils/
    ✓ server.js
    ✓ package.json
    ✓ .env (created by you)
  ✓ database/
    ✓ schema.sql
  ✓ README.md
  ✓ SETUP.md
  ✓ API_DOCS.md
```

---

## ❌ Troubleshooting

If something doesn't work, check:

1. **Backend won't start**
   - Verify Supabase credentials in `.env`
   - Check port 5000 is not in use
   - Run `npm install` again

2. **Frontend won't start**
   - Verify `.env.local` exists
   - Check port 5173 is not in use
   - Clear node_modules: `rm -rf node_modules && npm install`

3. **Can't create listing**
   - Check backend is running
   - Open browser DevTools → Console for errors
   - Check Network tab for API response
   - Verify Supabase credentials match

4. **Authentication fails**
   - User must be confirmed in Supabase
   - Check Supabase URL/keys are correct
   - Clear browser localStorage
   - Try logging out and in again

5. **Database errors**
   - Verify schema.sql ran successfully
   - Check RLS policies are enabled
   - Ensure user role matches enum values

---

## ✅ Success Criteria

You've successfully set up FoodBridge when:

✓ Backend server running without errors  
✓ Frontend app running without errors  
✓ Can signup as any role  
✓ Can login and see role-based dashboard  
✓ Can create food listing as Provider  
✓ Listing appears in Supabase database  
✓ API calls working (check Network tab)  
✓ Role-based navigation working  

---

## 🎉 All Done!

If you've checked all boxes above, **congratulations!**  
Your FoodBridge platform is fully operational.

**Next Steps:**
1. Review `PROJECT_SUMMARY.md` for what's been built
2. Check `API_DOCS.md` for API reference
3. Start building additional features
4. Prepare for deployment

**Happy Coding! 🚀**
