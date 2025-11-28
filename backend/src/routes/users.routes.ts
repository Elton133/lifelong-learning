import { Router } from 'express';

const router = Router();

// GET /api/users/me
router.get('/me', async (req, res) => {
  res.json({
    id: 'user-1',
    full_name: 'Alex Developer',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    seniority_level: 'senior',
    learning_style: 'hands-on',
    career_goals: [
      { title: 'Become a Tech Lead', target_date: '2025-06-01' },
    ],
    streak_count: 7,
    total_xp: 2450,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
});

// PATCH /api/users/me
router.patch('/me', async (req, res) => {
  const updates = req.body;
  
  res.json({
    id: 'user-1',
    ...updates,
    updated_at: new Date().toISOString(),
  });
});

// GET /api/users/me/skills
router.get('/me/skills', async (req, res) => {
  res.json([
    {
      id: 'us-1',
      user_id: 'user-1',
      skill_id: 'skill-1',
      mastery_level: 72,
      last_practiced: new Date(Date.now() - 86400000).toISOString(),
      practice_count: 15,
      growth_velocity: 2.5,
      skill: {
        id: 'skill-1',
        name: 'TypeScript',
        category: 'technical',
        description: 'Typed superset of JavaScript',
      },
    },
    {
      id: 'us-2',
      user_id: 'user-1',
      skill_id: 'skill-2',
      mastery_level: 85,
      last_practiced: new Date(Date.now() - 172800000).toISOString(),
      practice_count: 28,
      growth_velocity: 1.8,
      skill: {
        id: 'skill-2',
        name: 'React',
        category: 'technical',
        description: 'JavaScript library for building UIs',
      },
    },
  ]);
});

// GET /api/users/me/skill-graph
router.get('/me/skill-graph', async (req, res) => {
  res.json({
    nodes: [
      { id: 'skill-1', name: 'TypeScript', category: 'technical', mastery_level: 72, connections: ['skill-2', 'skill-3'] },
      { id: 'skill-2', name: 'React', category: 'technical', mastery_level: 85, connections: ['skill-1', 'skill-4'] },
    ],
  });
});

export default router;
