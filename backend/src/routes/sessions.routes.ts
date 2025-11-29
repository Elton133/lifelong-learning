import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase.client';

const router = Router();

// GET /api/sessions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const authHeader = req.headers.authorization;
    
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const maxSessions = limit ? parseInt(limit as string) : 10;
    
    const { data: sessions, error } = await supabaseAdmin
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
    const authHeader = req.headers.authorization;
    
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { data: session, error } = await supabaseAdmin
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
