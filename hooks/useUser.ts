'use client';

import useSWR from 'swr';
import { userAPI } from '@/lib/api';
import type { Profile, UserSkill, DashboardStats } from '@/types/database';

// Mock fetchers for demo - in production, these would use the real API
const fetchProfile = async (): Promise<Profile> => {
  const result = await userAPI.getProfile();
  if (result.error) throw new Error(result.error);
  return result.data!;
};

const fetchSkills = async (): Promise<UserSkill[]> => {
  const result = await userAPI.getSkills();
  if (result.error) throw new Error(result.error);
  return result.data!;
};

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const result = await userAPI.getDashboardStats();
  if (result.error) throw new Error(result.error);
  return result.data!;
};

export function useUser() {
  const { data: profile, error, isLoading, mutate } = useSWR<Profile>(
    '/users/me',
    fetchProfile,
    {
      revalidateOnFocus: false,
    }
  );

  const updateProfile = async (updates: Partial<Profile>) => {
    const result = await userAPI.updateProfile(updates);
    if (result.error) {
      throw new Error(result.error);
    }
    mutate(result.data!, false);
    return true;
  };

  return { 
    profile: profile || null, 
    loading: isLoading, 
    error: error?.message || null, 
    updateProfile, 
    refetch: mutate 
  };
}

export function useSkills() {
  const { data: skills, error, isLoading, mutate } = useSWR<UserSkill[]>(
    '/users/me/skills',
    fetchSkills,
    {
      revalidateOnFocus: false,
    }
  );

  return { 
    skills: skills || [], 
    loading: isLoading, 
    error: error?.message || null, 
    refetch: mutate 
  };
}

export function useDashboardStats() {
  const { data: stats, error, isLoading, mutate } = useSWR<DashboardStats>(
    '/analytics/progress',
    fetchDashboardStats,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return { 
    stats: stats || null, 
    loading: isLoading, 
    error: error?.message || null, 
    refetch: mutate 
  };
}
