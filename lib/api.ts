import axios, { AxiosRequestConfig } from 'axios';
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

// API client for frontend - uses mock data for demo, can be swapped for real API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
    // Mock implementation
    return { data: mockProfile };
    // Real implementation:
    // return fetchAPI<Profile>('/users/me');
  },

  async updateProfile(updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
    // Mock implementation
    return { data: { ...mockProfile, ...updates } };
    // Real implementation:
    // return fetchAPI<Profile>('/users/me', { method: 'PATCH', body: JSON.stringify(updates) });
  },

  async getSkills(): Promise<ApiResponse<UserSkill[]>> {
    // Mock implementation
    return { data: mockUserSkills };
    // Real implementation:
    // return fetchAPI<UserSkill[]>('/users/me/skills');
  },

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    // Mock implementation
    return { data: mockDashboardStats };
    // Real implementation:
    // return fetchAPI<DashboardStats>('/analytics/progress');
  },
};

// Content API
export const contentAPI = {
  async getAll(filters?: {
    skill?: string;
    difficulty?: string;
    type?: string;
  }): Promise<ApiResponse<LearningContent[]>> {
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
    // Real implementation:
    // const params = new URLSearchParams(filters as Record<string, string>);
    // return fetchAPI<LearningContent[]>(`/content?${params}`);
  },

  async getById(id: string): Promise<ApiResponse<LearningContent>> {
    // Mock implementation
    const content = mockLearningContent.find(c => c.id === id);
    if (!content) {
      return { error: 'Content not found' };
    }
    return { data: content };
    // Real implementation:
    // return fetchAPI<LearningContent>(`/content/${id}`);
  },

  async startSession(contentId: string): Promise<ApiResponse<LearningSession>> {
    // Mock implementation
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
    // Real implementation:
    // return fetchAPI<LearningSession>(`/content/${contentId}/start`, { method: 'POST' });
  },

  async completeSession(
    contentId: string,
    data: { performance_score: number; time_spent: number }
  ): Promise<ApiResponse<LearningSession>> {
    // Mock implementation
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
    // Real implementation:
    // return fetchAPI<LearningSession>(`/content/${contentId}/complete`, { 
    //   method: 'POST', 
    //   body: JSON.stringify(data) 
    // });
  },
};

// Playlist API
export const playlistAPI = {
  async getDaily(): Promise<ApiResponse<Playlist>> {
    // Mock implementation
    return { data: mockDailyPlaylist };
    // Real implementation:
    // return fetchAPI<Playlist>('/playlists/daily');
  },

  async getRecommended(): Promise<ApiResponse<Playlist[]>> {
    // Mock implementation - return playlist variations
    return { data: [mockDailyPlaylist] };
    // Real implementation:
    // return fetchAPI<Playlist[]>('/playlists/recommended');
  },

  async generate(_options?: { goalId?: string }): Promise<ApiResponse<Playlist>> {
    // Mock implementation - options would be used for goal-based playlist generation
    return { data: mockDailyPlaylist };
    // Real implementation:
    // return fetchAPI<Playlist>('/playlists/generate', { 
    //   method: 'POST', 
    //   body: JSON.stringify(options) 
    // });
  },
};

// Sessions API
export const sessionsAPI = {
  async getRecent(limit = 10): Promise<ApiResponse<LearningSession[]>> {
    // Mock implementation
    return { data: mockLearningSessions.slice(0, limit) };
    // Real implementation:
    // return fetchAPI<LearningSession[]>(`/sessions?limit=${limit}`);
  },
};

// Insights API
export const insightsAPI = {
  async getAll(): Promise<ApiResponse<Insight[]>> {
    // Mock implementation
    return { data: mockInsights };
    // Real implementation:
    // return fetchAPI<Insight[]>('/insights');
  },

  async markRead(id: string): Promise<ApiResponse<Insight>> {
    // Mock implementation
    const insight = mockInsights.find(i => i.id === id);
    if (!insight) {
      return { error: 'Insight not found' };
    }
    return { data: { ...insight, is_read: true } };
    // Real implementation:
    // return fetchAPI<Insight>(`/insights/${id}/mark-read`, { method: 'POST' });
  },

  async dismiss(_id: string): Promise<ApiResponse<void>> {
    // Mock implementation - id would be used to dismiss the insight
    return { data: undefined };
    // Real implementation:
    // return fetchAPI<void>(`/insights/dismiss/${id}`, { method: 'POST' });
  },
};

export { fetchAPI, swrFetcher };
