import axios, { AxiosRequestConfig } from 'axios';
import { supabase } from './supabase';
import type {
  Profile,
  UserSkill,
  LearningContent,
  Playlist,
  LearningSession,
  Insight,
  DashboardStats,
  ApiResponse,
} from '@/types/database';
import {
  mockProfile,
  mockUserSkills,
  mockLearningContent,
  mockDailyPlaylist,
  mockLearningSessions,
  mockInsights,
  mockDashboardStats,
} from './mock-data';

// API client for frontend - uses Supabase with fallback to mock data
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Feature flag to toggle between real and mock data
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function for API calls using axios
async function fetchAPI<T>(endpoint: string, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      ...options,
    });
    return { data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: error.response?.data?.message || error.message || 'An error occurred' };
    }
    return { error: 'Network error' };
  }
}

// SWR fetcher using axios
const swrFetcher = async <T>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url);
  return response.data;
};

// User API
export const userAPI = {
  async getProfile(): Promise<ApiResponse<Profile>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { data: mockProfile };
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        return { data: data as Profile };
      } catch (error) {
        console.error('Error fetching profile:', error);
        return { data: mockProfile };
      }
    }
    return { data: mockProfile };
  },

  async updateProfile(updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { error: 'Not authenticated' };
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        return { data: data as Profile };
      } catch (error) {
        console.error('Error updating profile:', error);
        return { error: 'Failed to update profile' };
      }
    }
    return { data: { ...mockProfile, ...updates } };
  },

  async getSkills(): Promise<ApiResponse<UserSkill[]>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { data: mockUserSkills };
        }
        
        const { data, error } = await supabase
          .from('user_skills')
          .select(`
            *,
            skill:skills(*)
          `)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { data: data as UserSkill[] };
      } catch (error) {
        console.error('Error fetching skills:', error);
        return { data: mockUserSkills };
      }
    }
    return { data: mockUserSkills };
  },

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { data: mockDashboardStats };
        }
        
        // Get profile for streak and XP
        const { data: profile } = await supabase
          .from('profiles')
          .select('streak_count, total_xp')
          .eq('id', user.id)
          .single();
        
        // Get skills count that are improving
        const { data: skills } = await supabase
          .from('user_skills')
          .select('id, growth_velocity')
          .eq('user_id', user.id)
          .gt('growth_velocity', 0);
        
        // Get today's learning time
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: sessions } = await supabase
          .from('learning_sessions')
          .select('time_spent')
          .eq('user_id', user.id)
          .gte('started_at', today.toISOString());
        
        const timeToday = sessions?.reduce((acc, s) => acc + (s.time_spent || 0), 0) || 0;
        
        return {
          data: {
            streak_count: profile?.streak_count || 0,
            total_xp: profile?.total_xp || 0,
            skills_improving: skills?.length || 0,
            time_invested_today: Math.round(timeToday / 60), // Convert to minutes
            weekly_progress: mockDashboardStats.weekly_progress, // TODO: Calculate from real data
          }
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return { data: mockDashboardStats };
      }
    }
    return { data: mockDashboardStats };
  },
};

// Content API
export const contentAPI = {
  async getAll(filters?: {
    skill?: string;
    difficulty?: string;
    type?: string;
  }): Promise<ApiResponse<LearningContent[]>> {
    if (USE_SUPABASE) {
      try {
        let query = supabase.from('learning_content').select('*');
        
        if (filters?.difficulty) {
          query = query.eq('difficulty', filters.difficulty);
        }
        if (filters?.type) {
          query = query.eq('content_type', filters.type);
        }
        // Skill filtering would need array contains operation
        if (filters?.skill) {
          query = query.contains('skill_ids', [filters.skill]);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return { data: data as LearningContent[] };
      } catch (error) {
        console.error('Error fetching content:', error);
        return { data: mockLearningContent };
      }
    }
    
    // Mock implementation with filtering
    let filtered = [...mockLearningContent];
    if (filters?.skill) {
      filtered = filtered.filter(c => c.skill_ids.includes(filters.skill!));
    }
    if (filters?.difficulty) {
      filtered = filtered.filter(c => c.difficulty === filters.difficulty);
    }
    if (filters?.type) {
      filtered = filtered.filter(c => c.content_type === filters.type);
    }
    return { data: filtered };
  },

  async getById(id: string): Promise<ApiResponse<LearningContent>> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('learning_content')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return { data: data as LearningContent };
      } catch (error) {
        console.error('Error fetching content:', error);
        const content = mockLearningContent.find(c => c.id === id);
        if (!content) {
          return { error: 'Content not found' };
        }
        return { data: content };
      }
    }
    
    const content = mockLearningContent.find(c => c.id === id);
    if (!content) {
      return { error: 'Content not found' };
    }
    return { data: content };
  },

  async startSession(contentId: string): Promise<ApiResponse<LearningSession>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { error: 'Not authenticated' };
        }
        
        const { data, error } = await supabase
          .from('learning_sessions')
          .insert({
            user_id: user.id,
            content_id: contentId,
            started_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        return { data: data as LearningSession };
      } catch (error) {
        console.error('Error starting session:', error);
        return { error: 'Failed to start session' };
      }
    }
    
    const session: LearningSession = {
      id: `session-${Date.now()}`,
      user_id: mockProfile.id,
      content_id: contentId,
      started_at: new Date().toISOString(),
      completed_at: null,
      performance_score: null,
      time_spent: null,
      notes: null,
      xp_earned: 0,
    };
    return { data: session };
  },

  async completeSession(
    contentId: string,
    data: { performance_score: number; time_spent: number; sessionId?: string }
  ): Promise<ApiResponse<LearningSession>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { error: 'Not authenticated' };
        }
        
        // Get content for XP calculation
        const { data: content } = await supabase
          .from('learning_content')
          .select('xp_reward')
          .eq('id', contentId)
          .single();
        
        const xpEarned = Math.round((content?.xp_reward || 10) * (1 + data.performance_score / 200));
        
        // Update session
        const { data: session, error } = await supabase
          .from('learning_sessions')
          .update({
            completed_at: new Date().toISOString(),
            performance_score: data.performance_score,
            time_spent: data.time_spent,
            xp_earned: xpEarned,
          })
          .eq('content_id', contentId)
          .eq('user_id', user.id)
          .is('completed_at', null)
          .select()
          .single();
        
        if (error) throw error;
        
        // Update user's total XP
        await supabase.rpc('increment_user_xp', { user_id: user.id, xp_amount: xpEarned });
        
        return { data: session as LearningSession };
      } catch (error) {
        console.error('Error completing session:', error);
        return { error: 'Failed to complete session' };
      }
    }
    
    const content = mockLearningContent.find(c => c.id === contentId);
    const session: LearningSession = {
      id: `session-${Date.now()}`,
      user_id: mockProfile.id,
      content_id: contentId,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      performance_score: data.performance_score,
      time_spent: data.time_spent,
      notes: null,
      xp_earned: Math.round((content?.xp_reward || 10) * (1 + data.performance_score / 200)),
    };
    return { data: session };
  },
};

// Playlist API
export const playlistAPI = {
  async getDaily(): Promise<ApiResponse<Playlist>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { data: mockDailyPlaylist };
        }
        
        // Get today's playlist
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: playlist, error } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', user.id)
          .eq('playlist_type', 'daily')
          .eq('is_active', true)
          .gte('created_at', today.toISOString())
          .single();
        
        if (error || !playlist) {
          // Return mock if no playlist exists
          return { data: mockDailyPlaylist };
        }
        
        // Get content for the playlist
        if (playlist.content_ids && playlist.content_ids.length > 0) {
          const { data: contents } = await supabase
            .from('learning_content')
            .select('*')
            .in('id', playlist.content_ids);
          
          return { 
            data: { 
              ...playlist, 
              contents: contents as LearningContent[] 
            } as Playlist 
          };
        }
        
        return { data: playlist as Playlist };
      } catch (error) {
        console.error('Error fetching playlist:', error);
        return { data: mockDailyPlaylist };
      }
    }
    return { data: mockDailyPlaylist };
  },

  async getRecommended(): Promise<ApiResponse<Playlist[]>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { data: [mockDailyPlaylist] };
        }
        
        const { data, error } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        return { data: data as Playlist[] };
      } catch (error) {
        console.error('Error fetching playlists:', error);
        return { data: [mockDailyPlaylist] };
      }
    }
    return { data: [mockDailyPlaylist] };
  },

  async generate(options?: { goalId?: string }): Promise<ApiResponse<Playlist>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { error: 'Not authenticated' };
        }
        
        // Get user preferences from localStorage
        const prefsString = typeof window !== 'undefined' 
          ? localStorage.getItem('userPreferences') 
          : null;
        const prefs = prefsString ? JSON.parse(prefsString) : {};
        
        // Get content based on user interests and learning style
        let query = supabase.from('learning_content').select('*').limit(5);
        
        // Filter by difficulty based on user's time commitment
        if (prefs.dailyTime === '5') {
          query = query.eq('difficulty', 'beginner').lte('estimated_duration', 5);
        } else if (prefs.dailyTime === '15') {
          query = query.lte('estimated_duration', 15);
        }
        
        const { data: contents, error: contentError } = await query;
        if (contentError) throw contentError;
        
        // Create playlist
        const { data: playlist, error } = await supabase
          .from('playlists')
          .insert({
            user_id: user.id,
            title: options?.goalId ? 'Goal-based Learning Path' : "Today's Learning Path",
            description: 'Personalized content based on your preferences',
            content_ids: contents?.map(c => c.id) || [],
            playlist_type: options?.goalId ? 'goal-based' : 'daily',
            is_active: true,
            expires_at: new Date(Date.now() + 86400000).toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return { 
          data: { 
            ...playlist, 
            contents: contents as LearningContent[] 
          } as Playlist 
        };
      } catch (error) {
        console.error('Error generating playlist:', error);
        return { data: mockDailyPlaylist };
      }
    }
    return { data: mockDailyPlaylist };
  },
};

// Sessions API
export const sessionsAPI = {
  async getRecent(limit = 10): Promise<ApiResponse<LearningSession[]>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { data: mockLearningSessions.slice(0, limit) };
        }
        
        const { data, error } = await supabase
          .from('learning_sessions')
          .select(`
            *,
            content:learning_content(*)
          `)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return { data: data as LearningSession[] };
      } catch (error) {
        console.error('Error fetching sessions:', error);
        return { data: mockLearningSessions.slice(0, limit) };
      }
    }
    return { data: mockLearningSessions.slice(0, limit) };
  },
};

// Insights API
export const insightsAPI = {
  async getAll(): Promise<ApiResponse<Insight[]>> {
    if (USE_SUPABASE) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { data: mockInsights };
        }
        
        const { data, error } = await supabase
          .from('insights')
          .select(`
            *,
            action_content:learning_content(*)
          `)
          .eq('user_id', user.id)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { data: data as Insight[] };
      } catch (error) {
        console.error('Error fetching insights:', error);
        return { data: mockInsights };
      }
    }
    return { data: mockInsights };
  },

  async markRead(id: string): Promise<ApiResponse<Insight>> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('insights')
          .update({ is_read: true })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return { data: data as Insight };
      } catch (error) {
        console.error('Error marking insight read:', error);
        return { error: 'Failed to mark insight as read' };
      }
    }
    
    const insight = mockInsights.find(i => i.id === id);
    if (!insight) {
      return { error: 'Insight not found' };
    }
    return { data: { ...insight, is_read: true } };
  },

  async dismiss(id: string): Promise<ApiResponse<void>> {
    if (USE_SUPABASE) {
      try {
        const { error } = await supabase
          .from('insights')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return { data: undefined };
      } catch (error) {
        console.error('Error dismissing insight:', error);
        return { error: 'Failed to dismiss insight' };
      }
    }
    return { data: undefined };
  },
};

export { fetchAPI, swrFetcher };
