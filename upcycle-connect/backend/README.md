# UpCycle Connect Backend API

Express.js backend API for the UpCycle Connect platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - Set `JWT_SECRET` to a secure random string
   - Configure Supabase credentials (when ready)

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)

### Materials
- `GET /api/materials` - Get all materials (with filters)
- `GET /api/materials/nearby` - Get nearby materials
- `GET /api/materials/:id` - Get material by ID
- `GET /api/materials/provider/:providerId` - Get materials by provider
- `POST /api/materials` - Create material (provider only, protected)
- `PUT /api/materials/:id` - Update material (provider only, protected)
- `DELETE /api/materials/:id` - Delete material (provider only, protected)

### Requests
- `GET /api/requests` - Get all requests
- `GET /api/requests/user` - Get user's requests (protected)
- `GET /api/requests/:id` - Get request by ID
- `GET /api/requests/seeker/:seekerId` - Get requests by seeker
- `GET /api/requests/provider/:providerId` - Get requests for provider
- `POST /api/requests` - Create request (seeker only, protected)
- `PUT /api/requests/:id` - Update request (protected)
- `DELETE /api/requests/:id` - Delete request (seeker only, protected)

### Impact
- `GET /api/impact/summary` - Get impact summary (protected)
- `GET /api/impact/user/:userId` - Get user impact
- `GET /api/impact/platform` - Get platform-wide impact

## Authentication

Protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Current Implementation

- **Storage**: Currently using in-memory storage (arrays)
- **Database**: Ready for Supabase integration
- **Authentication**: JWT-based with bcrypt password hashing
- **Authorization**: Role-based (provider/seeker)

## Next Steps

1. Integrate Supabase database
2. Replace in-memory storage with database queries
3. Add file upload for material images
4. Implement real-time features
5. Add email notifications

