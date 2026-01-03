# Supabase Database Integration Guide

This guide will walk you through integrating Supabase PostgreSQL database with the UpCycle Connect backend.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: upcycle-connect
   - **Database Password**: (choose a strong password - save it!)
   - **Region**: Choose closest to your users
5. Wait for project to be created (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (SUPABASE_URL)
   - **anon/public key** (SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

## Step 3: Set Up Environment Variables

Update your `.env` file in the backend folder:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 4: Create Database Tables

Go to **SQL Editor** in Supabase dashboard and run the following SQL:

### Users Table
```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('provider', 'seeker')),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on role
CREATE INDEX idx_users_role ON users(role);
```

### Materials Table
```sql
-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  condition VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  carbon_saved DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_materials_provider ON materials(provider_id);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_location ON materials(latitude, longitude);
```

### Requests Table
```sql
-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  quantity INTEGER,
  seeker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_requests_seeker ON requests(seeker_id);
CREATE INDEX idx_requests_material ON requests(material_id);
CREATE INDEX idx_requests_status ON requests(status);
```

### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Materials are publicly readable
CREATE POLICY "Materials are publicly readable" ON materials
  FOR SELECT USING (true);

-- Users can create their own materials
CREATE POLICY "Users can create own materials" ON materials
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

-- Users can update their own materials
CREATE POLICY "Users can update own materials" ON materials
  FOR UPDATE USING (auth.uid() = provider_id);

-- Requests are readable by owner and related material provider
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (auth.uid() = seeker_id);

-- Users can create their own requests
CREATE POLICY "Users can create own requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = seeker_id);
```

## Step 5: Update Backend Services

The backend services will be updated to use Supabase client instead of in-memory storage.

## Step 6: Test the Integration

1. Start your backend server: `npm start`
2. Test registration: `POST http://localhost:5000/api/auth/register`
3. Test login: `POST http://localhost:5000/api/auth/login`
4. Check Supabase dashboard → Table Editor to see your data

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your SUPABASE_URL and keys
2. **RLS Policy Errors**: Make sure RLS policies are set up correctly
3. **Foreign Key Errors**: Ensure referenced records exist
4. **JWT Errors**: Verify JWT_SECRET is set correctly

### Useful Supabase Dashboard Features

- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom queries
- **API Docs**: Auto-generated API documentation
- **Logs**: View real-time logs and errors

## Next Steps

After integration:
1. Add image uploads using Supabase Storage
2. Set up real-time subscriptions
3. Add email notifications
4. Implement advanced queries and aggregations

