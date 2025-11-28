import { Router } from 'express';

const router = Router();

const mockContent = [
  {
    id: 'content-1',
    title: 'TypeScript Generics Deep Dive',
    description: 'Master TypeScript generics for type-safe, reusable code',
    content_type: 'video',
    difficulty: 'intermediate',
    estimated_duration: 5,
    skill_ids: ['skill-1'],
    content_data: { video_url: 'https://example.com/video1' },
    xp_reward: 25,
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
          explanation: 'useEffect is designed to handle side effects.',
        },
      ],
    },
    xp_reward: 15,
  },
];

// GET /api/content
router.get('/', async (req, res) => {
  const { skill, difficulty, type } = req.query;
  
  let filtered = [...mockContent];
  
  if (skill) {
    filtered = filtered.filter(c => c.skill_ids.includes(skill as string));
  }
  if (difficulty) {
    filtered = filtered.filter(c => c.difficulty === difficulty);
  }
  if (type) {
    filtered = filtered.filter(c => c.content_type === type);
  }
  
  res.json(filtered);
});

// GET /api/content/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const content = mockContent.find(c => c.id === id);
  
  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  res.json(content);
});

// POST /api/content/:id/start
router.post('/:id/start', async (req, res) => {
  const { id } = req.params;
  
  res.json({
    id: `session-${Date.now()}`,
    user_id: 'user-1',
    content_id: id,
    started_at: new Date().toISOString(),
    completed_at: null,
    performance_score: null,
    time_spent: null,
    xp_earned: 0,
  });
});

// POST /api/content/:id/complete
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { performance_score, time_spent } = req.body;
  
  const content = mockContent.find(c => c.id === id);
  const baseXP = content?.xp_reward || 10;
  const bonus = (performance_score / 100) * 0.5;
  const xpEarned = Math.round(baseXP * (1 + bonus));
  
  res.json({
    id: `session-${Date.now()}`,
    user_id: 'user-1',
    content_id: id,
    started_at: new Date(Date.now() - time_spent * 1000).toISOString(),
    completed_at: new Date().toISOString(),
    performance_score,
    time_spent,
    xp_earned: xpEarned,
  });
});

export default router;
