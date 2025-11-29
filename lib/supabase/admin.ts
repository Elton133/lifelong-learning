/**
 * Backend Supabase Admin Client
 * 
 * This module provides the server-only Supabase admin client using the service role key.
 * 
 * SECURITY:
 * - Uses SUPABASE_SERVICE_ROLE_KEY (NEVER expose to browser)
 * - Bypasses all RLS (Row Level Security) policies
 * - Only import this in server-side code (API routes, backend services)
 * 
 * USAGE:
 * - Import this ONLY in backend/server code (Express routes, Next.js API routes, etc.)
 * - Used for: admin operations, data mutations that need to bypass RLS
 * 
 * WARNING: Never import this file in client-side code or components!
 * 
 * @example
 * ```ts
 * import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase/admin';
 * 
 * // Check configuration before use
 * if (!isAdminConfigured) {
 *   throw new Error('Database not configured');
 * }
 * 
 * // Bypass RLS to update user data
 * const { data } = await supabaseAdmin
 *   .from('profiles')
 *   .update({ total_xp: 100 })
 *   .eq('id', userId);
 * ```
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for server-only use (no NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if admin Supabase is properly configured
const isConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

// Log warning if not configured (server-side only)
if (!isConfigured) {
  console.warn(
    '[Supabase Admin] Missing configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
  );
}

/**
 * The server-side Supabase admin client instance.
 * 
 * IMPORTANT: This client uses the service role key and BYPASSES RLS.
 * Only use this for server-side operations that require admin privileges.
 * 
 * Returns null if not configured to prevent accidental usage.
 */
export const supabaseAdmin: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        // Disable auto-refresh for server-side usage
        autoRefreshToken: false,
        // Don't persist session on server
        persistSession: false,
      },
    })
  : null;

/**
 * Indicates whether the Supabase admin client is properly configured.
 * Always check this before using supabaseAdmin.
 */
export const isAdminConfigured = isConfigured;

/**
 * Verify a user's access token and return the user object.
 * Use this to authenticate requests in API routes.
 * 
 * @param token - The access token from the Authorization header
 * @returns The user object if valid, null otherwise
 */
export async function verifyUserToken(token: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Get a Supabase client that operates in the context of a specific user.
 * This is useful for operations that should still respect RLS but run on the server.
 * 
 * @param accessToken - The user's access token
 * @returns A Supabase client configured with the user's token
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase configuration missing for authenticated client');
  }
  
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
