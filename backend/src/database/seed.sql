-- Seed data for the Lifelong Learning Platform
-- Run this after schema.sql to populate initial data

-- Insert sample skills
INSERT INTO skills (id, name, category, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'TypeScript', 'technical', 'Typed superset of JavaScript for building robust applications'),
  ('22222222-2222-2222-2222-222222222222', 'React', 'technical', 'JavaScript library for building user interfaces'),
  ('33333333-3333-3333-3333-333333333333', 'Node.js', 'technical', 'JavaScript runtime for server-side development'),
  ('44444444-4444-4444-4444-444444444444', 'Next.js', 'technical', 'React framework for production applications'),
  ('55555555-5555-5555-5555-555555555555', 'PostgreSQL', 'technical', 'Powerful open source relational database'),
  ('66666666-6666-6666-6666-666666666666', 'Technical Communication', 'communication', 'Effectively communicate technical concepts to various audiences'),
  ('77777777-7777-7777-7777-777777777777', 'Code Review', 'leadership', 'Provide constructive feedback on code quality and design'),
  ('88888888-8888-8888-8888-888888888888', 'System Design', 'technical', 'Design scalable and maintainable software systems')
ON CONFLICT (name) DO NOTHING;

-- Update related_skills
UPDATE skills SET related_skills = ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid] WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE skills SET related_skills = ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '44444444-4444-4444-4444-444444444444'::uuid] WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE skills SET related_skills = ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '55555555-5555-5555-5555-555555555555'::uuid] WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE skills SET related_skills = ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid] WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE skills SET related_skills = ARRAY['33333333-3333-3333-3333-333333333333'::uuid] WHERE id = '55555555-5555-5555-5555-555555555555';
UPDATE skills SET related_skills = ARRAY['77777777-7777-7777-7777-777777777777'::uuid] WHERE id = '66666666-6666-6666-6666-666666666666';
UPDATE skills SET related_skills = ARRAY['66666666-6666-6666-6666-666666666666'::uuid, '11111111-1111-1111-1111-111111111111'::uuid] WHERE id = '77777777-7777-7777-7777-777777777777';
UPDATE skills SET related_skills = ARRAY['55555555-5555-5555-5555-555555555555'::uuid, '33333333-3333-3333-3333-333333333333'::uuid] WHERE id = '88888888-8888-8888-8888-888888888888';

-- Insert sample learning content
INSERT INTO learning_content (id, title, description, content_type, difficulty, estimated_duration, skill_ids, content_data, xp_reward) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'TypeScript Generics Deep Dive',
    'Master TypeScript generics for type-safe, reusable code',
    'video',
    'intermediate',
    5,
    ARRAY['11111111-1111-1111-1111-111111111111'::uuid],
    '{"video_url": "https://example.com/video1"}',
    25
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'React Hooks Quiz',
    'Test your knowledge of React hooks patterns',
    'quiz',
    'beginner',
    3,
    ARRAY['22222222-2222-2222-2222-222222222222'::uuid],
    '{
      "quiz_questions": [
        {
          "id": "q1",
          "question": "Which hook is used for side effects in React?",
          "options": ["useState", "useEffect", "useContext", "useReducer"],
          "correct_answer": 1,
          "explanation": "useEffect is designed to handle side effects like API calls, subscriptions, etc."
        },
        {
          "id": "q2",
          "question": "What does useState return?",
          "options": ["A value", "A function", "An array with value and setter", "An object"],
          "correct_answer": 2,
          "explanation": "useState returns an array with the current state value and a function to update it."
        }
      ]
    }',
    15
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Building REST APIs with Node.js',
    'Create scalable APIs using Express and best practices',
    'interactive',
    'intermediate',
    8,
    ARRAY['33333333-3333-3333-3333-333333333333'::uuid],
    '{"interactive_elements": [{"type": "fill-blank", "data": {"prompt": "Complete the route handler"}}]}',
    40
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Next.js App Router Patterns',
    'Learn modern Next.js patterns with the App Router',
    'scenario',
    'advanced',
    10,
    ARRAY['44444444-4444-4444-4444-444444444444'::uuid, '22222222-2222-2222-2222-222222222222'::uuid],
    '{
      "scenario_steps": [
        {
          "id": "s1",
          "description": "You need to create a dynamic route for user profiles",
          "choices": [
            {"text": "Create [userId]/page.tsx", "next_step": "s2", "feedback": "Correct!"},
            {"text": "Create userId/page.tsx", "feedback": "This creates a static route, not dynamic"}
          ]
        }
      ]
    }',
    50
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'SQL Query Optimization',
    'Optimize database queries for better performance',
    'sandbox',
    'advanced',
    12,
    ARRAY['55555555-5555-5555-5555-555555555555'::uuid],
    '{
      "sandbox_config": {
        "language": "sql",
        "starter_code": "SELECT * FROM users WHERE active = true;",
        "solution": "SELECT id, name FROM users WHERE active = true LIMIT 100;",
        "tests": ["Query should include LIMIT", "Query should specify columns"]
      }
    }',
    60
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Giving Effective Code Reviews',
    'Learn to provide constructive and helpful code review feedback',
    'video',
    'beginner',
    4,
    ARRAY['66666666-6666-6666-6666-666666666666'::uuid, '77777777-7777-7777-7777-777777777777'::uuid],
    '{"video_url": "https://example.com/video2"}',
    20
  );
