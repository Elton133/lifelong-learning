import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a placeholder client that won't make actual requests if not configured
const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Export configuration status
export const isSupabaseConfigured = isConfigured;

// Server-side client for API routes
export function createServerClient(accessToken?: string) {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    accessToken ? {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    } : undefined
  );
}
