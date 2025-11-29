import { Router, Request, Response } from 'express';
import { supabaseAdmin, verifyUserToken } from '../utils/supabase.client';

const router = Router();

/**
 * Helper to extract and verify user from request
 */
async function authenticateRequest(req: Request, res: Response) {
  if (!supabaseAdmin) {
    res.status(503).json({ error: 'Database not configured' });
    return null;
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const user = await verifyUserToken(token);
  
  if (!user) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
  
  return user;
}

// GET /api/sessions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const user = await authenticateRequest(req, res);
    if (!user) return;
    
    const maxSessions = limit ? parseInt(limit as string) : 10;
    
    const { data: sessions, error } = await supabaseAdmin!
      .from('learning_sessions')
      .select(`
        *,
        content:learning_content(*)
      `)
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(maxSessions);
    
    if (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
    
    res.json(sessions || []);
  } catch (error) {
    console.error('Error in GET /sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await authenticateRequest(req, res);
    if (!user) return;
    
    const { data: session, error } = await supabaseAdmin!
      .from('learning_sessions')
      .select(`
        *,
        content:learning_content(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching session:', error);
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error in GET /sessions/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
