'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          user: null,
          session: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get session',
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
        }));

        if (event === 'SIGNED_IN') {
          // Check if user has completed onboarding
          const hasOnboarded = localStorage.getItem('onboardingComplete');
          if (!hasOnboarded) {
            router.push('/onboarding');
          } else {
            router.push('/dashboard');
          }
        }

        if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Mock sign in for demo
      localStorage.setItem('mockUser', JSON.stringify({ email }));
      router.push('/dashboard');
      return { error: null };
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: data.user,
        session: data.session,
        loading: false,
      }));

      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return { error: message };
    }
  }, [router]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; role?: string; department?: string }
  ) => {
    if (!isSupabaseConfigured) {
      // Mock sign up for demo
      localStorage.setItem('mockUser', JSON.stringify({ email, ...metadata }));
      return { error: null };
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: data.user,
        session: data.session,
        loading: false,
      }));

      // Don't automatically redirect - let the calling component handle it
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return { error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('mockUser');
      router.push('/login');
      return;
    }

    try {
      await supabase.auth.signOut();
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('showTour');
      localStorage.removeItem('tourCompleted');
      localStorage.removeItem('userPreferences');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [router]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Reset failed' };
    }
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!state.user,
  };
}
