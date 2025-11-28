import { Router } from 'express';

const router = Router();

const mockInsights = [
  {
    id: 'insight-1',
    user_id: 'user-1',
    insight_type: 'suggestion',
    title: 'Time to level up TypeScript!',
    message: "You've been consistent with TypeScript practice. Ready to tackle advanced generics?",
    action_content_id: 'content-1',
    priority: 8,
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'insight-2',
    user_id: 'user-1',
    insight_type: 'encouragement',
    title: '7-day streak! 🔥',
    message: "Amazing dedication! You're in the top 10% of learners this week.",
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
  },
];

// GET /api/insights
router.get('/', async (req, res) => {
  res.json(mockInsights);
});

// POST /api/insights/:id/mark-read
router.post('/:id/mark-read', async (req, res) => {
  const { id } = req.params;
  const insight = mockInsights.find(i => i.id === id);
  
  if (!insight) {
    return res.status(404).json({ error: 'Insight not found' });
  }
  
  res.json({ ...insight, is_read: true });
});

// POST /api/insights/dismiss/:id
router.post('/dismiss/:id', async (req, res) => {
  const { id } = req.params;
  
  res.json({ message: 'Insight dismissed', id });
});

export default router;
