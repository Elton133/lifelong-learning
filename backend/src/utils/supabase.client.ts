/**
 * Backend Supabase Admin Client
 * 
 * This module provides the server-only Supabase admin client using the service role key.
 * 
 * SECURITY:
 * - Uses SUPABASE_SERVICE_ROLE_KEY (NEVER expose to browser)
 * - Bypasses all RLS (Row Level Security) policies
 * - Only use in server-side code (Express routes, backend services)
 * 
 * USAGE:
 * - Import supabaseAdmin for admin operations that bypass RLS
 * - Import createUserClient for operations that should respect RLS with user context
 * - Import verifyUserToken to authenticate incoming requests
 * 
 * @example
 * ```ts
 * import { supabaseAdmin, verifyUserToken } from './supabase.client';
 * 
 * // Verify user token from request
 * const user = await verifyUserToken(token);
 * if (!user) return res.status(401).json({ error: 'Invalid token' });
 * 
 * // Perform admin operation (bypasses RLS)
 * const { data } = await supabaseAdmin
 *   .from('profiles')
 *   .update({ total_xp: 100 })
 *   .eq('id', user.id);
 * ```
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Server-only environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '[Supabase Admin] Missing configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
  );
}

/**
 * Admin Supabase client with service role key.
 * BYPASSES RLS - use with caution!
 * 
 * Returns null if not configured to prevent accidental usage.
 */
export const supabaseAdmin: SupabaseClient | null = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Indicates whether the Supabase admin client is properly configured.
 */
export const isAdminConfigured = Boolean(supabaseAdmin);

/**
 * Verify a user's access token and return the user object.
 * Use this to authenticate requests in API routes.
 * 
 * @param token - The access token from the Authorization header
 * @returns The user object if valid, null otherwise
 */
export async function verifyUserToken(token: string): Promise<User | null> {
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
 * Create a Supabase client for a specific user context.
 * This client respects RLS policies as the authenticated user.
 * 
 * Use this when you need to perform operations that should respect
 * the user's permissions rather than bypassing RLS.
 * 
 * @param accessToken - The user's access token
 * @returns A Supabase client configured with the user's token
 */
export function createUserClient(accessToken: string): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }
  
  const key = supabaseAnonKey || '';
  
  return createClient(supabaseUrl, key, {
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
