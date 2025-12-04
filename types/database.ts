// Database types matching the Supabase schema

export interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  department: string | null;
  seniority_level: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | null;
  learning_style: 'visual' | 'hands-on' | 'reading' | 'video' | 'audio' | null;
  career_goals: CareerGoal[] | null;
  interests: string[] | null;
  daily_learning_time: number | null;
  streak_count: number;
  total_xp: number;
  created_at: string;
  updated_at: string;
}

export interface CareerGoal {
  title: string;
  target_date?: string;
  skill_ids?: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'communication' | 'leadership' | 'domain-specific' | null;
  description: string | null;
  related_skills: string[] | null;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  mastery_level: number; // 0-100
  last_practiced: string | null;
  practice_count: number;
  growth_velocity: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  skill?: Skill;
}

export interface LearningContent {
  id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'interactive' | 'scenario' | 'sandbox' | 'quiz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number; // in minutes
  skill_ids: string[];
  category: string | null;
  content_data: ContentData;
  prerequisites: string[] | null;
  xp_reward: number;
  created_at: string;
}

export interface ContentData {
  video_url?: string;
  quiz_questions?: QuizQuestion[];
  scenario_steps?: ScenarioStep[];
  sandbox_config?: SandboxConfig;
  interactive_elements?: InteractiveElement[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface ScenarioStep {
  id: string;
  description: string;
  choices: { text: string; next_step?: string; feedback?: string }[];
}

export interface SandboxConfig {
  language: string;
  starter_code: string;
  solution: string;
  tests: string[];
}

export interface InteractiveElement {
  type: 'hotspot' | 'drag-drop' | 'fill-blank';
  data: Record<string, unknown>;
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  content_ids: string[];
  playlist_type: 'daily' | 'weekly' | 'goal-based' | 'remedial';
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  // Joined data
  contents?: LearningContent[];
}

export interface LearningSession {
  id: string;
  user_id: string;
  content_id: string;
  started_at: string;
  completed_at: string | null;
  performance_score: number | null; // 0-100
  time_spent: number | null; // in seconds
  notes: SessionNotes | null;
  xp_earned: number;
  // Joined data
  content?: LearningContent;
}

export interface SessionNotes {
  mistakes?: string[];
  insights?: string[];
  feedback?: string;
}

export interface WorkEvent {
  id: string;
  user_id: string;
  event_type: 'code_commit' | 'email_sent' | 'task_completed' | 'meeting_attended';
  event_data: Record<string, unknown>;
  detected_skills: string[] | null;
  quality_score: number | null;
  created_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  insight_type: 'pattern_detected' | 'suggestion' | 'encouragement' | 'warning';
  title: string | null;
  message: string | null;
  action_content_id: string | null;
  priority: number; // 1-10
  is_read: boolean;
  created_at: string;
  // Joined data
  action_content?: LearningContent;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string | null;
  description: string | null;
  icon_url: string | null;
  earned_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// Dashboard types
export interface DashboardStats {
  streak_count: number;
  total_xp: number;
  skills_improving: number;
  time_invested_today: number; // in minutes
  weekly_progress: WeeklyProgress[];
}

export interface WeeklyProgress {
  day: string;
  xp_earned: number;
  sessions_completed: number;
}

export interface SkillGraphNode {
  id: string;
  name: string;
  category: string;
  mastery_level: number;
  connections: string[];
  last_practiced: string | null;
}
