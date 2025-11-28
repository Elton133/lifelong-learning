import type { 
  Profile, 
  Skill, 
  UserSkill, 
  LearningContent, 
  Playlist, 
  LearningSession,
  Insight,
  Achievement,
  DashboardStats
} from '@/types/database';

// Mock Skills
export const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'TypeScript',
    category: 'technical',
    description: 'Typed superset of JavaScript for building robust applications',
    related_skills: ['skill-2', 'skill-3'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'skill-2',
    name: 'React',
    category: 'technical',
    description: 'JavaScript library for building user interfaces',
    related_skills: ['skill-1', 'skill-4'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'skill-3',
    name: 'Node.js',
    category: 'technical',
    description: 'JavaScript runtime for server-side development',
    related_skills: ['skill-1', 'skill-5'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'skill-4',
    name: 'Next.js',
    category: 'technical',
    description: 'React framework for production applications',
    related_skills: ['skill-2', 'skill-1'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'skill-5',
    name: 'PostgreSQL',
    category: 'technical',
    description: 'Powerful open source relational database',
    related_skills: ['skill-3'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'skill-6',
    name: 'Technical Communication',
    category: 'communication',
    description: 'Effectively communicate technical concepts to various audiences',
    related_skills: ['skill-7'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'skill-7',
    name: 'Code Review',
    category: 'leadership',
    description: 'Provide constructive feedback on code quality and design',
    related_skills: ['skill-6', 'skill-1'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'skill-8',
    name: 'System Design',
    category: 'technical',
    description: 'Design scalable and maintainable software systems',
    related_skills: ['skill-5', 'skill-3'],
    created_at: new Date().toISOString(),
  },
];

// Mock User Skills
export const mockUserSkills: UserSkill[] = [
  {
    id: 'us-1',
    user_id: 'user-1',
    skill_id: 'skill-1',
    mastery_level: 72,
    last_practiced: new Date(Date.now() - 86400000).toISOString(),
    practice_count: 15,
    growth_velocity: 2.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skill: mockSkills[0],
  },
  {
    id: 'us-2',
    user_id: 'user-1',
    skill_id: 'skill-2',
    mastery_level: 85,
    last_practiced: new Date(Date.now() - 172800000).toISOString(),
    practice_count: 28,
    growth_velocity: 1.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skill: mockSkills[1],
  },
  {
    id: 'us-3',
    user_id: 'user-1',
    skill_id: 'skill-3',
    mastery_level: 45,
    last_practiced: new Date(Date.now() - 259200000).toISOString(),
    practice_count: 8,
    growth_velocity: 3.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skill: mockSkills[2],
  },
  {
    id: 'us-4',
    user_id: 'user-1',
    skill_id: 'skill-4',
    mastery_level: 58,
    last_practiced: new Date(Date.now() - 86400000).toISOString(),
    practice_count: 12,
    growth_velocity: 2.1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skill: mockSkills[3],
  },
  {
    id: 'us-5',
    user_id: 'user-1',
    skill_id: 'skill-6',
    mastery_level: 35,
    last_practiced: new Date(Date.now() - 432000000).toISOString(),
    practice_count: 5,
    growth_velocity: 1.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skill: mockSkills[5],
  },
];

// Mock Learning Content
export const mockLearningContent: LearningContent[] = [
  {
    id: 'content-1',
    title: 'TypeScript Generics Deep Dive',
    description: 'Master TypeScript generics for type-safe, reusable code',
    content_type: 'video',
    difficulty: 'intermediate',
    estimated_duration: 5,
    skill_ids: ['skill-1'],
    content_data: {
      video_url: 'https://example.com/video1',
    },
    prerequisites: null,
    xp_reward: 25,
    created_at: new Date().toISOString(),
  },
  {
    id: 'content-2',
    title: 'React Hooks Quiz',
    description: 'Test your knowledge of React hooks patterns',
    content_type: 'quiz',
    difficulty: 'beginner',
    estimated_duration: 3,
    skill_ids: ['skill-2'],
    content_data: {
      quiz_questions: [
        {
          id: 'q1',
          question: 'Which hook is used for side effects in React?',
          options: ['useState', 'useEffect', 'useContext', 'useReducer'],
          correct_answer: 1,
          explanation: 'useEffect is designed to handle side effects like API calls, subscriptions, etc.',
        },
        {
          id: 'q2',
          question: 'What does useState return?',
          options: ['A value', 'A function', 'An array with value and setter', 'An object'],
          correct_answer: 2,
          explanation: 'useState returns an array with the current state value and a function to update it.',
        },
      ],
    },
    prerequisites: null,
    xp_reward: 15,
    created_at: new Date().toISOString(),
  },
  {
    id: 'content-3',
    title: 'Building REST APIs with Node.js',
    description: 'Create scalable APIs using Express and best practices',
    content_type: 'interactive',
    difficulty: 'intermediate',
    estimated_duration: 8,
    skill_ids: ['skill-3'],
    content_data: {
      interactive_elements: [
        {
          type: 'fill-blank',
          data: { prompt: 'Complete the route handler' },
        },
      ],
    },
    prerequisites: null,
    xp_reward: 40,
    created_at: new Date().toISOString(),
  },
  {
    id: 'content-4',
    title: 'Next.js App Router Patterns',
    description: 'Learn modern Next.js patterns with the App Router',
    content_type: 'scenario',
    difficulty: 'advanced',
    estimated_duration: 10,
    skill_ids: ['skill-4', 'skill-2'],
    content_data: {
      scenario_steps: [
        {
          id: 's1',
          description: 'You need to create a dynamic route for user profiles',
          choices: [
            { text: 'Create [userId]/page.tsx', next_step: 's2', feedback: 'Correct!' },
            { text: 'Create userId/page.tsx', feedback: 'This creates a static route, not dynamic' },
          ],
        },
      ],
    },
    prerequisites: ['skill-2'],
    xp_reward: 50,
    created_at: new Date().toISOString(),
  },
  {
    id: 'content-5',
    title: 'SQL Query Optimization',
    description: 'Optimize database queries for better performance',
    content_type: 'sandbox',
    difficulty: 'advanced',
    estimated_duration: 12,
    skill_ids: ['skill-5'],
    content_data: {
      sandbox_config: {
        language: 'sql',
        starter_code: 'SELECT * FROM users WHERE active = true;',
        solution: 'SELECT id, name FROM users WHERE active = true LIMIT 100;',
        tests: ['Query should include LIMIT', 'Query should specify columns'],
      },
    },
    prerequisites: null,
    xp_reward: 60,
    created_at: new Date().toISOString(),
  },
  {
    id: 'content-6',
    title: 'Giving Effective Code Reviews',
    description: 'Learn to provide constructive and helpful code review feedback',
    content_type: 'video',
    difficulty: 'beginner',
    estimated_duration: 4,
    skill_ids: ['skill-6', 'skill-7'],
    content_data: {
      video_url: 'https://example.com/video2',
    },
    prerequisites: null,
    xp_reward: 20,
    created_at: new Date().toISOString(),
  },
];

// Mock Profile
export const mockProfile: Profile = {
  id: 'user-1',
  full_name: 'Alex Developer',
  role: 'Senior Software Engineer',
  department: 'Engineering',
  seniority_level: 'senior',
  learning_style: 'hands-on',
  career_goals: [
    { title: 'Become a Tech Lead', target_date: '2025-06-01', skill_ids: ['skill-7', 'skill-8'] },
    { title: 'Master System Design', skill_ids: ['skill-8'] },
  ],
  streak_count: 7,
  total_xp: 2450,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock Daily Playlist
export const mockDailyPlaylist: Playlist = {
  id: 'playlist-1',
  user_id: 'user-1',
  title: "Today's Learning Path",
  description: 'Personalized content based on your goals and current skills',
  content_ids: ['content-1', 'content-2', 'content-6'],
  playlist_type: 'daily',
  is_active: true,
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 86400000).toISOString(),
  contents: [mockLearningContent[0], mockLearningContent[1], mockLearningContent[5]],
};

// Mock Learning Sessions
export const mockLearningSessions: LearningSession[] = [
  {
    id: 'session-1',
    user_id: 'user-1',
    content_id: 'content-1',
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86100000).toISOString(),
    performance_score: 85,
    time_spent: 300,
    notes: { insights: ['Learned about generic constraints'] },
    xp_earned: 30,
    content: mockLearningContent[0],
  },
  {
    id: 'session-2',
    user_id: 'user-1',
    content_id: 'content-2',
    started_at: new Date(Date.now() - 172800000).toISOString(),
    completed_at: new Date(Date.now() - 172620000).toISOString(),
    performance_score: 100,
    time_spent: 180,
    notes: null,
    xp_earned: 22,
    content: mockLearningContent[1],
  },
];

// Mock Insights
export const mockInsights: Insight[] = [
  {
    id: 'insight-1',
    user_id: 'user-1',
    insight_type: 'suggestion',
    title: 'Time to level up TypeScript!',
    message: 'You\'ve been consistent with TypeScript practice. Ready to tackle advanced generics?',
    action_content_id: 'content-1',
    priority: 8,
    is_read: false,
    created_at: new Date().toISOString(),
    action_content: mockLearningContent[0],
  },
  {
    id: 'insight-2',
    user_id: 'user-1',
    insight_type: 'encouragement',
    title: '7-day streak! 🔥',
    message: 'Amazing dedication! You\'re in the top 10% of learners this week.',
    action_content_id: null,
    priority: 6,
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'insight-3',
    user_id: 'user-1',
    insight_type: 'pattern_detected',
    title: 'Communication skills opportunity',
    message: 'Based on your recent code reviews, improving technical communication could boost your leadership track.',
    action_content_id: 'content-6',
    priority: 7,
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    action_content: mockLearningContent[5],
  },
];

// Mock Achievements
export const mockAchievements: Achievement[] = [
  {
    id: 'ach-1',
    user_id: 'user-1',
    achievement_type: 'streak',
    title: 'Week Warrior',
    description: 'Maintained a 7-day learning streak',
    icon_url: '🔥',
    earned_at: new Date().toISOString(),
  },
  {
    id: 'ach-2',
    user_id: 'user-1',
    achievement_type: 'mastery',
    title: 'React Expert',
    description: 'Reached 80% mastery in React',
    icon_url: '⚛️',
    earned_at: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'ach-3',
    user_id: 'user-1',
    achievement_type: 'xp',
    title: 'XP Champion',
    description: 'Earned over 2000 XP',
    icon_url: '🏆',
    earned_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  streak_count: 7,
  total_xp: 2450,
  skills_improving: 4,
  time_invested_today: 15,
  weekly_progress: [
    { day: 'Mon', xp_earned: 45, sessions_completed: 2 },
    { day: 'Tue', xp_earned: 62, sessions_completed: 3 },
    { day: 'Wed', xp_earned: 30, sessions_completed: 1 },
    { day: 'Thu', xp_earned: 55, sessions_completed: 2 },
    { day: 'Fri', xp_earned: 78, sessions_completed: 3 },
    { day: 'Sat', xp_earned: 22, sessions_completed: 1 },
    { day: 'Sun', xp_earned: 40, sessions_completed: 2 },
  ],
};
