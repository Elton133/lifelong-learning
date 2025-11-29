/**
 * Server-Side Supabase Client with User Context
 * 
 * This module provides server-side Supabase operations that maintain user context.
 * Unlike the admin client, this respects RLS policies while running on the server.
 * 
 * SECURITY:
 * - Uses the user's access token for authentication
 * - RLS policies are enforced (as the authenticated user)
 * - Safe to use for operations that should respect user permissions
 * 
 * USAGE:
 * - Import this in API routes, Next.js Server Components, or middleware
 * - Used for: server-side operations that should respect user permissions
 * 
 * @example
 * ```ts
 * import { createServerClient, getUserFromRequest } from '@/lib/supabase/server';
 * 
 * // In an Express route handler
 * app.get('/api/data', async (req, res) => {
 *   const user = await getUserFromRequest(req);
 *   if (!user) return res.status(401).json({ error: 'Unauthorized' });
 *   
 *   const token = req.headers.authorization?.split(' ')[1];
 *   const supabase = createServerClient(token);
 *   
 *   // This query respects RLS policies
 *   const { data } = await supabase.from('profiles').select('*');
 * });
 * ```
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase URL from environment
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates a Supabase client configured with a user's access token.
 * This client respects RLS policies and operates as the authenticated user.
 * 
 * @param accessToken - The user's JWT access token (optional)
 * @returns A Supabase client configured for the user's context
 * 
 * @example
 * ```ts
 * const token = req.headers.authorization?.split(' ')[1];
 * const supabase = createServerClient(token);
 * 
 * // Query respects RLS - user can only see their own data
 * const { data } = await supabase.from('profiles').select('*');
 * ```
 */
export function createServerClient(accessToken?: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration missing. Set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_* equivalents).'
    );
  }
  
  const options: Parameters<typeof createClient>[2] = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  };
  
  // If an access token is provided, include it in request headers
  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, options);
}

/**
 * Request object interface for Express/HTTP requests
 */
interface RequestWithHeaders {
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
}

/**
 * Extracts and verifies the user from an incoming request.
 * Uses the Authorization header to get the user's identity.
 * 
 * @param req - The incoming request object (Express, Next.js, etc.)
 * @returns The authenticated user or null if not authenticated
 * 
 * @example
 * ```ts
 * app.get('/api/protected', async (req, res) => {
 *   const user = await getUserFromRequest(req);
 *   if (!user) {
 *     return res.status(401).json({ error: 'Not authenticated' });
 *   }
 *   
 *   // User is authenticated, proceed with the request
 *   res.json({ userId: user.id });
 * });
 * ```
 */
export async function getUserFromRequest(req: RequestWithHeaders) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return null;
  }
  
  // Import admin client only when needed to verify token
  const { supabaseAdmin } = await import('./admin');
  
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured for token verification');
  }
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Middleware helper to extract the access token from a request.
 * 
 * @param req - The incoming request object
 * @returns The access token or null if not present
 */
export function getTokenFromRequest(req: RequestWithHeaders): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1] || null;
}
