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

// Backend API URL - used for server-side operations when needed
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Axios client for backend API calls (used for operations that require server processing)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function for backend API calls using axios
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

// SWR fetcher using axios for backend API calls
const swrFetcher = async <T>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url);
  return response.data;
};

// ============================================================================
// Frontend APIs - Use Supabase directly for real-time user data
// ============================================================================

// User API - Uses Supabase for real-time user data
export const userAPI = {
  async getProfile(): Promise<ApiResponse<Profile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
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
      return { error: 'Failed to fetch profile' };
    }
  },

  async updateProfile(updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
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
  },

  async getSkills(): Promise<ApiResponse<UserSkill[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
      }
      
      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return { data: (data || []) as UserSkill[] };
    } catch (error) {
      console.error('Error fetching skills:', error);
      return { error: 'Failed to fetch skills' };
    }
  },

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
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
      
      // Calculate weekly progress
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      
      const { data: weekSessions } = await supabase
        .from('learning_sessions')
        .select('started_at, xp_earned')
        .eq('user_id', user.id)
        .gte('started_at', weekStart.toISOString())
        .not('completed_at', 'is', null);
      
      // Group by day for weekly progress
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyProgress = days.map(day => ({
        day,
        xp_earned: 0,
        sessions_completed: 0,
      }));
      
      weekSessions?.forEach(session => {
        const sessionDate = new Date(session.started_at);
        const dayName = days[sessionDate.getDay()];
        const dayEntry = weeklyProgress.find(d => d.day === dayName);
        if (dayEntry) {
          dayEntry.xp_earned += session.xp_earned || 0;
          dayEntry.sessions_completed += 1;
        }
      });
      
      return {
        data: {
          streak_count: profile?.streak_count || 0,
          total_xp: profile?.total_xp || 0,
          skills_improving: skills?.length || 0,
          time_invested_today: Math.round(timeToday / 60), // Convert to minutes
          weekly_progress: weeklyProgress,
        }
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { error: 'Failed to fetch dashboard stats' };
    }
  },
};

// Content API - Uses Supabase for learning content
export const contentAPI = {
  async getAll(filters?: {
    skill?: string;
    difficulty?: string;
    type?: string;
  }): Promise<ApiResponse<LearningContent[]>> {
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
      return { data: (data || []) as LearningContent[] };
    } catch (error) {
      console.error('Error fetching content:', error);
      return { error: 'Failed to fetch content' };
    }
  },

  async getById(id: string): Promise<ApiResponse<LearningContent>> {
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
      return { error: 'Content not found' };
    }
  },

  async startSession(contentId: string): Promise<ApiResponse<LearningSession>> {
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
  },

  async completeSession(
    contentId: string,
    sessionData: { performance_score: number; time_spent: number; sessionId?: string }
  ): Promise<ApiResponse<LearningSession>> {
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
      
      const xpEarned = Math.round((content?.xp_reward || 10) * (1 + sessionData.performance_score / 200));
      
      // Update session
      const { data: session, error } = await supabase
        .from('learning_sessions')
        .update({
          completed_at: new Date().toISOString(),
          performance_score: sessionData.performance_score,
          time_spent: sessionData.time_spent,
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
  },
};

// Playlist API - Uses Supabase with AI-powered generation
export const playlistAPI = {
  async getDaily(): Promise<ApiResponse<Playlist>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
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
        // No playlist exists for today, generate one
        return await playlistAPI.generate();
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
      return { error: 'Failed to fetch playlist' };
    }
  },

  async getRecommended(): Promise<ApiResponse<Playlist[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
      }
      
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return { data: (data || []) as Playlist[] };
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return { error: 'Failed to fetch playlists' };
    }
  },

  async generate(options?: { goalId?: string }): Promise<ApiResponse<Playlist>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
      }
      
      // Get user profile for personalization
      const { data: profile } = await supabase
        .from('profiles')
        .select('learning_style, career_goals')
        .eq('id', user.id)
        .single();
      
      // Get user skills to identify areas for improvement
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('skill_id, mastery_level, skill:skills(name)')
        .eq('user_id', user.id)
        .order('mastery_level', { ascending: true });
      
      // Get user preferences from localStorage
      const prefsString = typeof window !== 'undefined' 
        ? localStorage.getItem('userPreferences') 
        : null;
      const prefs = prefsString ? JSON.parse(prefsString) : {};
      
      // Build intelligent content query based on user context
      let query = supabase.from('learning_content').select('*');
      
      // Prioritize content for skills with lower mastery
      const lowMasterySkillIds = userSkills
        ?.filter(s => s.mastery_level < 50)
        .map(s => s.skill_id) || [];
      
      if (lowMasterySkillIds.length > 0) {
        query = query.overlaps('skill_ids', lowMasterySkillIds);
      }
      
      // Filter by difficulty based on user's time commitment and learning style
      if (prefs.dailyTime === '5') {
        query = query.eq('difficulty', 'beginner').lte('estimated_duration', 5);
      } else if (prefs.dailyTime === '15') {
        query = query.lte('estimated_duration', 15);
      } else {
        query = query.lte('estimated_duration', 30);
      }
      
      // Prefer content type based on learning style
      if (profile?.learning_style === 'visual' || profile?.learning_style === 'video') {
        query = query.eq('content_type', 'video');
      } else if (profile?.learning_style === 'hands-on') {
        query = query.in('content_type', ['interactive', 'sandbox']);
      }
      
      query = query.limit(5);
      
      const { data: contents, error: contentError } = await query;
      if (contentError) throw contentError;
      
      // Create personalized playlist
      const { data: playlist, error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          title: options?.goalId ? 'Goal-based Learning Path' : "Today's Learning Path",
          description: 'AI-personalized content based on your skills and preferences',
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
      return { error: 'Failed to generate playlist' };
    }
  },
};

// Sessions API - Uses Supabase for session data
export const sessionsAPI = {
  async getRecent(limit = 10): Promise<ApiResponse<LearningSession[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
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
      return { data: (data || []) as LearningSession[] };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return { error: 'Failed to fetch sessions' };
    }
  },
};

// Insights API - Uses Supabase with AI-generated insights
export const insightsAPI = {
  async getAll(): Promise<ApiResponse<Insight[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
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
      return { data: (data || []) as Insight[] };
    } catch (error) {
      console.error('Error fetching insights:', error);
      return { error: 'Failed to fetch insights' };
    }
  },

  async markRead(id: string): Promise<ApiResponse<Insight>> {
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
  },

  async dismiss(id: string): Promise<ApiResponse<void>> {
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
  },
};

export { fetchAPI, swrFetcher };
