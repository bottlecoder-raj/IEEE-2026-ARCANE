# Quick Start: Supabase Integration

## Step-by-Step Integration

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details and wait for creation (2-3 minutes)

### 2. Get Your Credentials
1. Go to **Settings** → **API** in Supabase dashboard
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3. Set Up Database
1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste the entire contents of `database-schema.sql`
3. Click "Run" to create tables, indexes, and policies

### 4. Configure Backend
1. In `backend` folder, create `.env` file:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Start the server:
```bash
npm start
```

### 5. Test the Integration

#### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "provider",
    "location": "New York, NY"
  }'
```

#### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Verify in Supabase
1. Go to **Table Editor** in Supabase dashboard
2. Select `users` table
3. You should see your registered user!

## Verification Checklist

- [ ] Supabase project created
- [ ] Database schema created (tables, indexes, triggers)
- [ ] Environment variables set in `.env`
- [ ] Backend server starts without errors
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Data appears in Supabase Table Editor

## Troubleshooting

### "Supabase URL not configured"
- Check your `.env` file exists
- Verify `SUPABASE_URL` is set correctly
- Restart the server after changing `.env`

### "Database error" or connection issues
- Verify your Supabase credentials are correct
- Check Supabase project is active (not paused)
- Ensure database schema was created successfully

### "User already exists" error
- This is expected if you try to register the same email twice
- Try with a different email or delete the user from Supabase Table Editor

### RLS Policy Errors
- The backend uses service_role key which bypasses RLS
- Policies are set up for future use with Supabase Auth
- If you see RLS errors, check the policies in `database-schema.sql`

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Create materials via API
3. ✅ Create requests via API
4. ✅ View data in Supabase dashboard
5. 🔄 Add image uploads (Supabase Storage)
6. 🔄 Set up real-time subscriptions
7. 🔄 Add email notifications

## Database Schema Overview

```
users
├── id (UUID, Primary Key)
├── email (Unique)
├── password_hash
├── name
├── role (provider/seeker)
└── location

materials
├── id (UUID, Primary Key)
├── name
├── description
├── category
├── quantity
├── condition
├── location, latitude, longitude
├── provider_id (Foreign Key → users.id)
├── status
└── carbon_saved

requests
├── id (UUID, Primary Key)
├── title
├── description
├── material_id (Foreign Key → materials.id)
├── quantity
├── seeker_id (Foreign Key → users.id)
└── status
```

All tables have `created_at` and `updated_at` timestamps that auto-update!

