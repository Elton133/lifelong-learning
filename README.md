# Lifelong Learning Platform

A modern corporate learning platform built with Next.js, Supabase, and Express.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Frontend (Next.js)](#frontend-nextjs)
- [Backend (Express API)](#backend-express-api)
- [API Reference](#api-reference)
- [Security Best Practices](#security-best-practices)
- [Common Operations](#common-operations)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

This platform uses a split architecture with clear separation between:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         FRONTEND (Browser)                          │   │
│   │                                                                     │   │
│   │   Next.js App (port 3000)                                          │   │
│   │   ├── lib/supabase/client.ts  → Anon key (browser-safe)            │   │
│   │   ├── hooks/useAuth.ts        → Auth state management              │   │
│   │   ├── lib/api.ts              → Supabase queries with RLS          │   │
│   │   └── components/             → React UI components                │   │
│   │                                                                     │   │
│   │   Uses: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY    │   │
│   │   RLS: ✓ Enforced                                                  │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    │ API calls with Bearer token            │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         BACKEND (Server)                            │   │
│   │                                                                     │   │
│   │   Express API (port 4000)                                          │   │
│   │   ├── src/utils/supabase.client.ts → Service role key (admin)      │   │
│   │   ├── src/routes/*.routes.ts       → API endpoints                 │   │
│   │   └── Handles: Session completion, XP updates, skill tracking      │   │
│   │                                                                     │   │
│   │   Uses: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY                    │   │
│   │   RLS: ✗ Bypassed (admin access)                                   │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    │ Database operations                    │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                           SUPABASE                                  │   │
│   │                                                                     │   │
│   │   ├── Authentication (Supabase Auth)                               │   │
│   │   ├── Database (PostgreSQL with RLS)                               │   │
│   │   ├── Storage (for content assets)                                 │   │
│   │   └── Realtime (optional subscriptions)                            │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Supabase Setup

### Folder Structure

```
lib/supabase/
├── client.ts    # Frontend client (anon key, browser-safe)
├── admin.ts     # Backend admin client (service role key, server-only)
├── server.ts    # Server-side with user context (respects RLS)
└── index.ts     # Central exports with documentation
```

### Client Types

| Client | Location | Key Used | RLS | Use Case |
|--------|----------|----------|-----|----------|
| `supabase` | `lib/supabase/client.ts` | Anon Key | ✓ Enforced | Browser operations, auth, user queries |
| `supabaseAdmin` | `lib/supabase/admin.ts` | Service Role | ✗ Bypassed | Backend mutations, cross-table updates |
| `createServerClient(token)` | `lib/supabase/server.ts` | Anon Key + Token | ✓ Enforced | Server-side with user context |

### When to Use Each Client

```typescript
// ✅ FRONTEND: Use supabase (anon key, respects RLS)
import { supabase } from '@/lib/supabase/client';

const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id);

// ✅ BACKEND: Use supabaseAdmin (service role, bypasses RLS)
import { supabaseAdmin } from '../utils/supabase.client';

// Can update any user's data (admin operation)
await supabaseAdmin
  .from('profiles')
  .update({ total_xp: newXP })
  .eq('id', userId);

// ✅ SERVER WITH USER CONTEXT: Use createServerClient (respects RLS)
import { createServerClient } from '@/lib/supabase/server';

const supabase = createServerClient(accessToken);
const { data } = await supabase.from('profiles').select('*');
```

---

## Environment Variables

### Frontend (.env.local)

```env
# These are safe to expose in the browser (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend (.env)

```env
# These are SERVER-ONLY (no NEXT_PUBLIC_ prefix)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Key Security Rules

| Variable | Public? | Where to Use |
|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Frontend only |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Frontend only |
| `SUPABASE_URL` | ❌ No | Backend only |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | Backend only (NEVER expose!) |
| `SUPABASE_ANON_KEY` | ❌ No | Backend (for authenticated server calls) |

---

## Frontend (Next.js)

### Running the Frontend

```bash
cd /path/to/project
npm install
npm run dev      # Development (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Browser-safe Supabase client |
| `lib/api.ts` | API functions for data operations |
| `hooks/useAuth.ts` | Authentication hook |
| `hooks/useUser.ts` | User profile hook |
| `hooks/usePlaylist.ts` | Playlist data hook |
| `hooks/useInsights.ts` | AI insights hook |

### Example: Fetching User Profile

```typescript
// In a React component
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

function ProfileComponent() {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    async function fetchProfile() {
      if (!isSupabaseConfigured) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
    }
    
    fetchProfile();
  }, []);
  
  return <div>{profile?.full_name}</div>;
}
```

---

## Backend (Express API)

### Running the Backend

```bash
cd /path/to/project/backend
npm install
npm run dev      # Development with hot reload
npm run build    # Compile TypeScript
npm run start    # Start production server
```

### Key Files

| File | Purpose |
|------|---------|
| `src/server.ts` | Server entry point |
| `src/app.ts` | Express app configuration |
| `src/utils/supabase.client.ts` | Supabase admin client |
| `src/routes/*.routes.ts` | API route handlers |

### Authentication Pattern

All protected routes use the `verifyUserToken` helper:

```typescript
import { supabaseAdmin, verifyUserToken } from '../utils/supabase.client';

router.get('/protected', async (req, res) => {
  // Check if Supabase is configured
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }
  
  // Verify user token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const token = authHeader.split(' ')[1];
  const user = await verifyUserToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // User is authenticated, proceed with operation
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  res.json(data);
});
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/session` | Get current session |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update current user profile |
| GET | `/api/users/me/skills` | Get user's skills |
| GET | `/api/users/me/skill-graph` | Get skill graph data |

### Content Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | List all content |
| GET | `/api/content/:id` | Get content by ID |
| POST | `/api/content/:id/start` | Start learning session |
| POST | `/api/content/:id/complete` | Complete learning session |

### Playlist Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/playlists/daily` | Get or generate daily playlist |
| GET | `/api/playlists/recommended` | Get recommended playlists |
| GET | `/api/playlists/:id` | Get playlist by ID |
| POST | `/api/playlists/generate` | Generate new playlist |

### Session Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | Get recent learning sessions |
| GET | `/api/sessions/:id` | Get session by ID |

### Insight Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights` | Get AI-generated insights |
| POST | `/api/insights/:id/mark-read` | Mark insight as read |
| POST | `/api/insights/dismiss/:id` | Dismiss an insight |

### Skills Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | List all available skills |
| GET | `/api/skills/:id` | Get skill by ID |

---

## Security Best Practices

### ✅ DO

1. **Use anon key in browser**: Always use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for frontend
2. **Use service role in backend**: Only use `SUPABASE_SERVICE_ROLE_KEY` in server code
3. **Verify tokens**: Always verify user tokens before performing mutations
4. **Enable RLS**: Configure Row Level Security policies for all tables
5. **Validate input**: Sanitize and validate all user input

### ❌ DON'T

1. **Never expose service role key**: Don't use `NEXT_PUBLIC_` prefix for service role key
2. **Never skip token verification**: Always check `Authorization` header
3. **Never trust client data**: Validate all data server-side
4. **Never bypass RLS unnecessarily**: Only use admin client when required

### RLS Policy Examples

```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can only see their own learning sessions
CREATE POLICY "Users can view own sessions"
ON learning_sessions FOR SELECT
USING (auth.uid() = user_id);
```

---

## Common Operations

### Complete a Learning Session (Backend)

This is a critical operation that updates multiple tables:

```typescript
// POST /api/content/:id/complete
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { performance_score, time_spent } = req.body;
  
  // 1. Authenticate user
  const user = await authenticateRequest(req, res);
  if (!user) return;
  
  // 2. Get content for XP calculation
  const { data: content } = await supabaseAdmin!
    .from('learning_content')
    .select('xp_reward, skill_ids')
    .eq('id', id)
    .single();
  
  // 3. Calculate XP earned
  const baseXP = content?.xp_reward || 10;
  const bonus = (performance_score / 100) * 0.5;
  const xpEarned = Math.round(baseXP * (1 + bonus));
  
  // 4. Update session (admin client bypasses RLS for reliable update)
  const { data: session } = await supabaseAdmin!
    .from('learning_sessions')
    .update({
      completed_at: new Date().toISOString(),
      performance_score,
      time_spent,
      xp_earned: xpEarned,
    })
    .eq('content_id', id)
    .eq('user_id', user.id)
    .is('completed_at', null)
    .select()
    .single();
  
  // 5. Update user's total XP
  const { data: profile } = await supabaseAdmin!
    .from('profiles')
    .select('total_xp')
    .eq('id', user.id)
    .single();
  
  await supabaseAdmin!
    .from('profiles')
    .update({
      total_xp: (profile?.total_xp || 0) + xpEarned,
    })
    .eq('id', user.id);
  
  // 6. Update skill mastery
  if (content?.skill_ids) {
    for (const skillId of content.skill_ids) {
      const masteryIncrease = Math.round((performance_score / 100) * 5);
      
      const { data: existingSkill } = await supabaseAdmin!
        .from('user_skills')
        .select('mastery_level, practice_count')
        .eq('user_id', user.id)
        .eq('skill_id', skillId)
        .single();
      
      if (existingSkill) {
        await supabaseAdmin!
          .from('user_skills')
          .update({
            mastery_level: Math.min(100, existingSkill.mastery_level + masteryIncrease),
            practice_count: existingSkill.practice_count + 1,
          })
          .eq('user_id', user.id)
          .eq('skill_id', skillId);
      } else {
        await supabaseAdmin!
          .from('user_skills')
          .insert({
            user_id: user.id,
            skill_id: skillId,
            mastery_level: masteryIncrease,
            practice_count: 1,
          });
      }
    }
  }
  
  res.json(session);
});
```

### Add Authentication to Frontend API Calls

```typescript
// In lib/api.ts
import { getAccessToken } from '@/lib/supabase/client';

async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
}

// Usage
const response = await makeAuthenticatedRequest('/api/content/123/complete', {
  method: 'POST',
  body: JSON.stringify({ performance_score: 85, time_spent: 600 }),
});
```

---

## Troubleshooting

### 406 Not Acceptable Error

**Cause**: Usually happens when RLS policies block the operation.

**Solution**: 
1. Check if the operation should use the admin client (bypasses RLS)
2. Verify your RLS policies allow the operation for the authenticated user
3. Ensure the `Authorization` header is being sent correctly

### Session Not Updating

**Cause**: RLS policies may block updates on `learning_sessions` table.

**Solution**: Use the admin client for session updates in the backend:

```typescript
// ❌ This may fail due to RLS
const supabase = createServerClient(token);
await supabase.from('learning_sessions').update(data);

// ✅ Use admin client for reliable updates
await supabaseAdmin!.from('learning_sessions').update(data);
```

### Service Key Exposed in Browser

**Cause**: Using `NEXT_PUBLIC_` prefix for service role key.

**Solution**: 
1. Remove the `NEXT_PUBLIC_` prefix from the service role key variable
2. Never import `lib/supabase/admin.ts` in client-side code
3. Rotate your service role key immediately if exposed

### "Database not configured" Error

**Cause**: Environment variables are not set or not loaded.

**Solution**:
1. Check your `.env` file exists
2. Restart your development server after adding env vars
3. Verify the variable names match exactly

---

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` (frontend) and `backend/.env` (backend)
3. Fill in your Supabase credentials
4. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   ```
5. Start the development servers:
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend && npm run dev
   ```
6. Open http://localhost:3000

---

## Database Schema

The platform uses the following main tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profile data (extends Supabase auth.users) |
| `skills` | Available skills catalog |
| `user_skills` | User's skill mastery levels |
| `learning_content` | Learning materials (videos, quizzes, etc.) |
| `learning_sessions` | User learning session tracking |
| `playlists` | AI-generated learning playlists |
| `insights` | AI-generated personalized insights |
| `achievements` | User achievements and badges |

See `backend/src/database/schema.sql` for the complete schema.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
