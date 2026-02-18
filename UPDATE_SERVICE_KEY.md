# Update Service Role Key

## Steps:

1. **Get the Service Role Key:**
   - Go to https://supabase.com/dashboard/project/kzfzsvvmrqudsqiukvbk/settings/api
   - Scroll to "Project API keys"
   - Copy the **`service_role`** key (NOT the `anon` key)
   - It should be a very long JWT token starting with `eyJhbGc...`

2. **Update server/.env:**
   - Open `E:\Food\server\.env`
   - Replace the line:
     ```
   SUPABASE_SERVICE_ROLE_KEY=<paste the long service_role key here>
     ```
   - With:
     ```
     SUPABASE_SERVICE_ROLE_KEY=<paste the long service_role key here>
     ```

3. **Restart the backend server:**
   - Stop the current server (Ctrl+C in the terminal)
   - Run: `npm run dev` from the server directory

## Why is this needed?

The backend auth middleware needs to query the `users` table to get your profile information, but Row Level Security (RLS) policies prevent the regular client from reading the data. The service role key bypasses RLS for server-side operations.

## Alternative Quick Fix (if you can't get service role key immediately):

You can temporarily disable RLS on the users table in Supabase SQL Editor:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

⚠️ **WARNING**: This is NOT recommended for production! Only use for testing locally.
