/**
 * Frontend Supabase Client
 * 
 * This module provides the browser-safe Supabase client using ONLY the anon key.
 * 
 * SECURITY:
 * - Uses NEXT_PUBLIC_SUPABASE_ANON_KEY (safe for browser exposure)
 * - Never uses service role key
 * - All operations respect RLS (Row Level Security) policies
 * 
 * USAGE:
 * - Import this in React components, hooks, and client-side code
 * - Used for: authentication, user data queries that respect RLS
 * 
 * @example
 * ```ts
 * import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
 * 
 * // Check auth state
 * const { data: { user } } = await supabase.auth.getUser();
 * 
 * // Query data (respects RLS)
 * const { data } = await supabase.from('profiles').select('*').eq('id', user.id);
 * ```
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for frontend (NEXT_PUBLIC_* prefix makes them available in browser)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Validate configuration and provide helpful error messages
if (!isConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Supabase Client] Missing configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
  );
}

/**
 * The frontend Supabase client instance.
 * 
 * WARNING: This client uses the anon key and respects RLS policies.
 * Never use admin operations with this client.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Enable auto-refresh for session tokens
      autoRefreshToken: true,
      // Persist session in localStorage
      persistSession: true,
      // Detect session from URL (for OAuth callbacks)
      detectSessionInUrl: true,
    },
  }
);

/**
 * Indicates whether Supabase is properly configured.
 * Use this to conditionally render features or show configuration warnings.
 */
export const isSupabaseConfigured = isConfigured;

/**
 * Get the current access token from the session.
 * Useful for passing to backend API calls that need user authentication.
 * 
 * @returns The current access token or null if not authenticated
 */
export async function getAccessToken(): Promise<string | null> {
  if (!isConfigured) return null;
  
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
