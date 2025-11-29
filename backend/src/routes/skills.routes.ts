import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase.client';

const router = Router();

// GET /api/skills
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    
    const { data: skills, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching skills:', error);
      return res.status(500).json({ error: 'Failed to fetch skills' });
    }
    
    res.json(skills || []);
  } catch (error) {
    console.error('Error in GET /skills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/skills/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    
    const { data: skill, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching skill:', error);
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    res.json(skill);
  } catch (error) {
    console.error('Error in GET /skills/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
