'use client';

import useSWR from 'swr';
import { insightsAPI } from '@/lib/api';
import type { Insight } from '@/types/database';

// Mock fetcher for demo - in production, this would use the real API
const fetchInsights = async (): Promise<Insight[]> => {
  const result = await insightsAPI.getAll();
  if (result.error) throw new Error(result.error);
  return result.data!;
};

export function useInsights() {
  const { data: insights, error, isLoading, mutate } = useSWR<Insight[]>(
    '/insights',
    fetchInsights,
    {
      revalidateOnFocus: false,
    }
  );

  const markRead = async (id: string) => {
    const result = await insightsAPI.markRead(id);
    if (result.error) {
      throw new Error(result.error);
    }
    // Optimistically update the cache
    mutate(
      insights?.map(i => i.id === id ? { ...i, is_read: true } : i),
      false
    );
    return true;
  };

  const dismiss = async (id: string) => {
    const result = await insightsAPI.dismiss(id);
    if (result.error) {
      throw new Error(result.error);
    }
    // Optimistically remove from cache
    mutate(
      insights?.filter(i => i.id !== id),
      false
    );
    return true;
  };

  return { 
    insights: insights || [], 
    loading: isLoading, 
    error: error?.message || null, 
    markRead,
    dismiss,
    refetch: mutate 
  };
}
