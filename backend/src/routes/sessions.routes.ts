import { Router } from 'express';

const router = Router();

// GET /api/sessions
router.get('/', async (req, res) => {
  const { limit } = req.query;
  
  const sessions = [
    {
      id: 'session-1',
      user_id: 'user-1',
      content_id: 'content-1',
      started_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 86100000).toISOString(),
      performance_score: 85,
      time_spent: 300,
      xp_earned: 30,
    },
    {
      id: 'session-2',
      user_id: 'user-1',
      content_id: 'content-2',
      started_at: new Date(Date.now() - 172800000).toISOString(),
      completed_at: new Date(Date.now() - 172620000).toISOString(),
      performance_score: 100,
      time_spent: 180,
      xp_earned: 22,
    },
  ];
  
  const maxSessions = limit ? parseInt(limit as string) : 10;
  res.json(sessions.slice(0, maxSessions));
});

// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  res.json({
    id,
    user_id: 'user-1',
    content_id: 'content-1',
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86100000).toISOString(),
    performance_score: 85,
    time_spent: 300,
    xp_earned: 30,
  });
});

export default router;
