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
  onboarding_completed: boolean;
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
  content_type: 'video' | 'interactive' | 'scenario' | 'sandbox' | 'quiz' | 'text';
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
  demo_config?: DemoConfig;
  text_content?: TextContent;
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

// Demo Configuration for Interactive Demos
export interface DemoConfig {
  demo_type: 'video' | 'code' | 'drag-drop' | 'simulation';
  video_demo?: VideoDemoConfig;
  code_demo?: CodeDemoConfig;
  drag_drop_demo?: DragDropDemoConfig;
}

// Video Demo with interactive elements
export interface VideoDemoConfig {
  video_url: string;
  interactive_moments?: InteractiveMoment[];
  captions_url?: string;
  allow_speed_control?: boolean;
}

export interface InteractiveMoment {
  timestamp: number; // in seconds
  type: 'quiz' | 'tip' | 'highlight';
  quiz_question?: QuizQuestion;
  tip_content?: string;
  highlight_area?: { x: number; y: number; width: number; height: number };
}

// Code Demo for hands-on practice
export interface CodeDemoConfig {
  language: string;
  starter_code: string;
  solution_code: string;
  test_cases?: TestCase[];
  hints?: Hint[];
  instructions: string;
}

export interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  description: string;
}

export interface Hint {
  id: string;
  level: number; // 1 = gentle, 2 = more direct, 3 = solution
  content: string;
}

// Drag & Drop Demo for simulations
export interface DragDropDemoConfig {
  title: string;
  description: string;
  elements: DraggableElement[];
  drop_zones: DropZone[];
  correct_mappings: { [elementId: string]: string }; // elementId -> dropZoneId
  validation_type: 'immediate' | 'on-submit';
}

export interface DraggableElement {
  id: string;
  content: string;
  type: 'text' | 'image' | 'icon';
  image_url?: string;
  icon_name?: string;
}

export interface DropZone {
  id: string;
  label: string;
  accepts?: string[]; // types of elements it accepts
  max_items?: number;
}

// Text Content for reading materials
export interface TextContent {
  content_type: 'passage' | 'pdf';
  text_passage?: string;
  pdf_url?: string;
  sections?: TextSection[];
  reading_time?: number; // estimated reading time in minutes
}

export interface TextSection {
  id: string;
  title: string;
  content: string;
  order: number;
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

// ============================================================================
// PWA, Push Notifications, and Voice Calls Types
// ============================================================================

export interface UserPreferences {
  id: string;
  user_id: string;
  // Notification preferences
  notifications_enabled: boolean;
  push_enabled: boolean;
  notification_time_start: string; // HH:MM:SS format
  notification_time_end: string;
  notification_types: {
    lesson_reminders: boolean;
    new_content: boolean;
    achievements: boolean;
    insights: boolean;
  };
  // Voice call preferences
  calls_enabled: boolean;
  call_time_start: string;
  call_time_end: string;
  call_frequency: 'daily' | 'weekly' | 'biweekly' | 'never';
  preferred_call_duration: number;
  // General preferences
  timezone: string;
  quiet_days: string[];
  created_at: string;
  updated_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  notification_type: 'push' | 'email' | 'sms';
  category: string | null;
  title: string | null;
  message: string | null;
  sent_at: string;
  delivered: boolean;
  clicked: boolean;
  clicked_at: string | null;
  metadata: Record<string, unknown>;
}

export interface CallLog {
  id: string;
  user_id: string;
  call_type: 'reminder' | 'micro_lesson';
  call_sid: string | null;
  phone_number: string | null;
  content_id: string | null;
  status: 'queued' | 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy' | 'canceled';
  duration: number | null;
  audio_url: string | null;
  call_data: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
  user_responded: boolean;
  response_data: Record<string, unknown> | null;
}

export interface PwaInstallation {
  id: string;
  user_id: string;
  platform: string | null;
  installed_at: string;
  last_used_at: string;
  is_active: boolean;
}

export interface ScheduledEvent {
  id: string;
  user_id: string;
  event_type: 'notification' | 'call';
  category: string | null;
  scheduled_for: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled';
  payload: Record<string, unknown>;
  created_at: string;
  processed_at: string | null;
}
