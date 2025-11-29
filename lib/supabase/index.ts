/**
 * Supabase Module Index
 * 
 * This is the central export point for all Supabase functionality.
 * Import from here for clarity about which client you're using.
 * 
 * ARCHITECTURE OVERVIEW:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         SUPABASE ARCHITECTURE                          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  ┌──────────────────────────────────────────────────────────────────┐  │
 * │  │                      FRONTEND (Browser)                          │  │
 * │  │                                                                  │  │
 * │  │   client.ts                                                      │  │
 * │  │   ├── Uses: NEXT_PUBLIC_SUPABASE_ANON_KEY                       │  │
 * │  │   ├── Safe for: Browser exposure                                │  │
 * │  │   ├── RLS: Enforced ✓                                           │  │
 * │  │   └── Import in: React components, hooks, client-side code      │  │
 * │  │                                                                  │  │
 * │  └──────────────────────────────────────────────────────────────────┘  │
 * │                                                                         │
 * │  ┌──────────────────────────────────────────────────────────────────┐  │
 * │  │                      BACKEND (Server)                            │  │
 * │  │                                                                  │  │
 * │  │   admin.ts                                                       │  │
 * │  │   ├── Uses: SUPABASE_SERVICE_ROLE_KEY                           │  │
 * │  │   ├── Safe for: Server-only                                     │  │
 * │  │   ├── RLS: Bypassed (admin access)                              │  │
 * │  │   └── Import in: API routes, backend services, cron jobs        │  │
 * │  │                                                                  │  │
 * │  │   server.ts                                                      │  │
 * │  │   ├── Uses: Access token from user session                      │  │
 * │  │   ├── Safe for: Server-side with user context                   │  │
 * │  │   ├── RLS: Enforced (as the authenticated user)                 │  │
 * │  │   └── Import in: API routes needing user context with RLS       │  │
 * │  │                                                                  │  │
 * │  └──────────────────────────────────────────────────────────────────┘  │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * ENVIRONMENT VARIABLES:
 * 
 * Frontend (public, safe for browser):
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Public anonymous key (limited permissions)
 * 
 * Backend (private, server-only):
 * - SUPABASE_URL: Your Supabase project URL (or use NEXT_PUBLIC_SUPABASE_URL)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (full admin access)
 * - SUPABASE_ANON_KEY: Anonymous key for authenticated server calls with RLS
 * 
 * COMMON MISTAKES TO AVOID:
 * 
 * ❌ Don't import admin.ts in client-side code
 * ❌ Don't use service role key with NEXT_PUBLIC_ prefix
 * ❌ Don't bypass RLS when user-context operations work
 * ❌ Don't store service role key in frontend environment
 * 
 * ✓ Use client.ts for all browser-side Supabase operations
 * ✓ Use admin.ts for server-side admin operations
 * ✓ Use server.ts for server-side user-context operations
 * ✓ Always verify user tokens before performing mutations
 */

// Frontend exports (safe for browser)
export { 
  supabase, 
  isSupabaseConfigured,
  getAccessToken,
} from './client';

// Backend exports (server-only)
// Note: These are exported but should ONLY be imported in server-side code
export { 
  supabaseAdmin, 
  isAdminConfigured,
  verifyUserToken,
  createAuthenticatedClient,
} from './admin';

// Server-side session handling
export {
  createServerClient,
  getUserFromRequest,
} from './server';

// Type exports
export type { SupabaseClient } from '@supabase/supabase-js';
