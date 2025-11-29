import { Router, Request, Response } from 'express';
import { supabaseAdmin, verifyUserToken } from '../utils/supabase.client';

const router = Router();

// Constants for skill progression
const MAX_MASTERY_INCREASE_PER_SESSION = 5; // Maximum mastery points gained per completed session

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

// GET /api/content
router.get('/', async (req: Request, res: Response) => {
  try {
    const { skill, difficulty, type } = req.query;
    
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    
    let query = supabaseAdmin.from('learning_content').select('*');
    
    if (skill) {
      query = query.contains('skill_ids', [skill as string]);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (type) {
      query = query.eq('content_type', type);
    }
    
    const { data: content, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching content:', error);
      return res.status(500).json({ error: 'Failed to fetch content' });
    }
    
    res.json(content || []);
  } catch (error) {
    console.error('Error in GET /content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/content/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    
    const { data: content, error } = await supabaseAdmin
      .from('learning_content')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching content:', error);
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error in GET /content/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/content/:id/start
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await authenticateRequest(req, res);
    if (!user) return;
    
    const { data: session, error } = await supabaseAdmin!
      .from('learning_sessions')
      .insert({
        user_id: user.id,
        content_id: id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error starting session:', error);
      return res.status(500).json({ error: 'Failed to start session' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error in POST /content/:id/start:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/content/:id/complete
 * 
 * Completes a learning session using the ADMIN client.
 * 
 * WHY ADMIN CLIENT:
 * - This operation needs to update multiple tables atomically
 * - Updates learning_sessions (session completion)
 * - Updates profiles (user XP)
 * - Updates user_skills (skill mastery)
 * - Using admin client bypasses RLS for reliable cross-table updates
 * 
 * SECURITY:
 * - Still verifies user token before performing any operations
 * - Only updates data belonging to the authenticated user
 * - Admin client is ONLY used server-side, never exposed to browser
 */
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { performance_score, time_spent } = req.body;
    const user = await authenticateRequest(req, res);
    if (!user) return;
    
    // Validate input
    if (typeof performance_score !== 'number' || !Number.isFinite(performance_score) || performance_score < 0 || performance_score > 100) {
      return res.status(400).json({ error: 'Invalid performance_score (must be 0-100)' });
    }
    
    if (typeof time_spent !== 'number' || !Number.isFinite(time_spent) || time_spent < 0) {
      return res.status(400).json({ error: 'Invalid time_spent (must be a finite positive number)' });
    }
    
    // Get content for XP calculation (using admin client)
    const { data: content } = await supabaseAdmin!
      .from('learning_content')
      .select('xp_reward, skill_ids')
      .eq('id', id)
      .single();
    
    // Calculate XP earned based on performance
    const baseXP = content?.xp_reward || 10;
    const bonus = (performance_score / 100) * 0.5;
    const xpEarned = Math.round(baseXP * (1 + bonus));
    
    // Update the session (using admin client to bypass RLS for reliable update)
    const { data: session, error: sessionError } = await supabaseAdmin!
      .from('learning_sessions')
      .update({
        completed_at: new Date().toISOString(),
        performance_score,
        time_spent,
        xp_earned: xpEarned,
      })
      .eq('content_id', id)
      .eq('user_id', user.id)
      .is('completed_at', null)
      .select()
      .single();
    
    if (sessionError) {
      console.error('Error completing session:', sessionError);
      return res.status(500).json({ error: 'Failed to complete session' });
    }
    
    // Update user's total XP (using admin client for cross-table update)
    const { data: profile } = await supabaseAdmin!
      .from('profiles')
      .select('total_xp, streak_count')
      .eq('id', user.id)
      .single();
    
    await supabaseAdmin!
      .from('profiles')
      .update({
        total_xp: (profile?.total_xp || 0) + xpEarned,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    // Update skill mastery if content has associated skills
    if (content?.skill_ids && content.skill_ids.length > 0) {
      for (const skillId of content.skill_ids) {
        // Increment mastery level based on performance
        const masteryIncrease = Math.round((performance_score / 100) * MAX_MASTERY_INCREASE_PER_SESSION);
        
        // Check if user has this skill tracked
        const { data: existingSkill } = await supabaseAdmin!
          .from('user_skills')
          .select('mastery_level, practice_count')
          .eq('user_id', user.id)
          .eq('skill_id', skillId)
          .single();
        
        if (existingSkill) {
          // Update existing skill
          await supabaseAdmin!
            .from('user_skills')
            .update({
              mastery_level: Math.min(100, existingSkill.mastery_level + masteryIncrease),
              practice_count: existingSkill.practice_count + 1,
              last_practiced: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('skill_id', skillId);
        } else {
          // Create new skill record
          await supabaseAdmin!
            .from('user_skills')
            .insert({
              user_id: user.id,
              skill_id: skillId,
              mastery_level: masteryIncrease,
              practice_count: 1,
              last_practiced: new Date().toISOString(),
              growth_velocity: masteryIncrease,
            });
        }
      }
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error in POST /content/:id/complete:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
