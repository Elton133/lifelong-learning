/**
 * Supabase Client Re-exports
 * 
 * This file provides backward compatibility by re-exporting from the new
 * modular structure in lib/supabase/.
 * 
 * For new code, import directly from:
 * - '@/lib/supabase/client' for frontend (browser-safe) operations
 * - '@/lib/supabase/admin' for backend (server-only) operations
 * - '@/lib/supabase/server' for server-side with user context
 * 
 * @deprecated Import from '@/lib/supabase' or specific modules instead
 */

// Re-export frontend client for backward compatibility
export { supabase, isSupabaseConfigured } from './supabase/client';

// Re-export server client for backward compatibility
export { createServerClient } from './supabase/server';
