'use client';

import useSWR from 'swr';
import { playlistAPI, contentAPI } from '@/lib/api';
import type { Playlist, LearningContent } from '@/types/database';

// Mock fetchers for demo - in production, these would use the real API
const fetchDailyPlaylist = async (): Promise<Playlist> => {
  const result = await playlistAPI.getDaily();
  if (result.error) throw new Error(result.error);
  return result.data!;
};

const fetchContent = async (id: string): Promise<LearningContent> => {
  const result = await contentAPI.getById(id);
  if (result.error) throw new Error(result.error);
  return result.data!;
};

const fetchAllContent = async (): Promise<LearningContent[]> => {
  const result = await contentAPI.getAll();
  if (result.error) throw new Error(result.error);
  return result.data!;
};

export function usePlaylist() {
  const { data: playlist, error, isLoading, mutate } = useSWR<Playlist>(
    '/playlists/daily',
    fetchDailyPlaylist,
    {
      revalidateOnFocus: false,
    }
  );

  const generateNew = async (options?: { goalId?: string }) => {
    const result = await playlistAPI.generate(options);
    if (result.error) {
      throw new Error(result.error);
    }
    mutate(result.data!, false);
    return true;
  };

  return { 
    playlist: playlist || null, 
    loading: isLoading, 
    error: error?.message || null, 
    generateNew, 
    refetch: mutate 
  };
}

export function useContent(id?: string) {
  const { data: content, error, isLoading, mutate } = useSWR<LearningContent>(
    id ? `/content/${id}` : null,
    () => fetchContent(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return { 
    content: content || null, 
    loading: isLoading, 
    error: error?.message || null, 
    refetch: mutate 
  };
}

export function useContentList(filters?: {
  skill?: string;
  difficulty?: string;
  type?: string;
}) {
  const cacheKey = filters 
    ? `/content?${new URLSearchParams(filters as Record<string, string>).toString()}`
    : '/content';

  const { data: contents, error, isLoading, mutate } = useSWR<LearningContent[]>(
    cacheKey,
    fetchAllContent,
    {
      revalidateOnFocus: false,
    }
  );

  return { 
    contents: contents || [], 
    loading: isLoading, 
    error: error?.message || null, 
    refetch: mutate 
  };
}
