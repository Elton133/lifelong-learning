import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase.client';

const router = Router();

// GET /api/users/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    
    // If no auth header, return error
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Fetch profile from database
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error in /users/me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/users/me
router.patch('/me', async (req: Request, res: Response) => {
  try {
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
    
    const updates = req.body;
    
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error in PATCH /users/me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/me/skills
router.get('/me/skills', async (req: Request, res: Response) => {
  try {
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
    
    const { data: skills, error } = await supabaseAdmin
      .from('user_skills')
      .select(`
        *,
        skill:skills(*)
      `)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching skills:', error);
      return res.status(500).json({ error: 'Failed to fetch skills' });
    }
    
    res.json(skills || []);
  } catch (error) {
    console.error('Error in /users/me/skills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/me/skill-graph
router.get('/me/skill-graph', async (req: Request, res: Response) => {
  try {
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
    
    // Get user skills with related skill data
    const { data: userSkills, error } = await supabaseAdmin
      .from('user_skills')
      .select(`
        mastery_level,
        skill:skills(id, name, category, related_skills)
      `)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching skill graph:', error);
      return res.status(500).json({ error: 'Failed to fetch skill graph' });
    }
    
    // Transform to graph nodes format
    const nodes = (userSkills || []).map((us) => {
      const skillData = Array.isArray(us.skill) ? us.skill[0] : us.skill;
      return {
        id: skillData?.id || '',
        name: skillData?.name || '',
        category: skillData?.category || '',
        mastery_level: us.mastery_level,
        connections: skillData?.related_skills || [],
      };
    }).filter(node => node.id); // Filter out any empty entries
    
    res.json({ nodes });
  } catch (error) {
    console.error('Error in /users/me/skill-graph:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
