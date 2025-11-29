import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase.client';

const router = Router();

// Constants for mastery level thresholds
const LOW_SKILL_MASTERY_THRESHOLD = 40;
const HIGH_SKILL_MASTERY_THRESHOLD = 70;

// Helper to generate AI-powered insights based on user context
async function generateAIInsights(userId: string): Promise<void> {
  if (!supabaseAdmin) return;
  
  try {
    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('streak_count, total_xp')
      .eq('id', userId)
      .single();
    
    // Get user skills
    const { data: userSkills } = await supabaseAdmin
      .from('user_skills')
      .select('mastery_level, skill:skills(name)')
      .eq('user_id', userId);
    
    const insights: Array<{
      user_id: string;
      insight_type: string;
      title: string;
      message: string;
      priority: number;
    }> = [];
    
    // Streak-based encouragement
    if (profile?.streak_count && profile.streak_count >= 7) {
      insights.push({
        user_id: userId,
        insight_type: 'encouragement',
        title: `${profile.streak_count}-day streak! 🔥`,
        message: "Amazing dedication! You're in the top 10% of learners this week.",
        priority: 8,
      });
    } else if (profile?.streak_count && profile.streak_count >= 3) {
      insights.push({
        user_id: userId,
        insight_type: 'encouragement',
        title: 'Great progress!',
        message: `You're on a ${profile.streak_count}-day streak. Just ${7 - profile.streak_count} more days to reach a week!`,
        priority: 6,
      });
    }
    
    // Skill-based suggestions
    if (userSkills && userSkills.length > 0) {
      const lowMasterySkills = userSkills.filter((s: { mastery_level: number }) => s.mastery_level < LOW_SKILL_MASTERY_THRESHOLD);
      const highMasterySkills = userSkills.filter((s: { mastery_level: number }) => s.mastery_level >= HIGH_SKILL_MASTERY_THRESHOLD);
      
      if (lowMasterySkills.length > 0) {
        const skillEntry = lowMasterySkills[0];
        const skillData = Array.isArray(skillEntry.skill) ? skillEntry.skill[0] : skillEntry.skill;
        if (skillData?.name) {
          insights.push({
            user_id: userId,
            insight_type: 'suggestion',
            title: 'Skill boost opportunity',
            message: `Your ${skillData.name} skill could use some practice. We've got content ready for you!`,
            priority: 7,
          });
        }
      }
      
      if (highMasterySkills.length > 0) {
        const skillEntry = highMasterySkills[0];
        const skillData = Array.isArray(skillEntry.skill) ? skillEntry.skill[0] : skillEntry.skill;
        if (skillData?.name) {
          insights.push({
            user_id: userId,
            insight_type: 'pattern_detected',
            title: `Expert in ${skillData.name}!`,
            message: `You're doing great with ${skillData.name}. Ready to challenge yourself with advanced content?`,
            priority: 5,
          });
        }
      }
    }
    
    // Insert new insights if any
    if (insights.length > 0) {
      // Remove existing unread insights of the same type first
      for (const insight of insights) {
        await supabaseAdmin
          .from('insights')
          .delete()
          .eq('user_id', userId)
          .eq('insight_type', insight.insight_type)
          .eq('is_read', false);
      }
      
      // Insert new insights
      await supabaseAdmin.from('insights').insert(insights);
    }
  } catch (error) {
    console.error('Error generating AI insights:', error);
  }
}

// GET /api/insights
router.get('/', async (req: Request, res: Response) => {
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
    
    // Generate fresh AI insights
    await generateAIInsights(user.id);
    
    // Fetch all insights for the user
    const { data: insights, error } = await supabaseAdmin
      .from('insights')
      .select(`
        *,
        action_content:learning_content(*)
      `)
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching insights:', error);
      return res.status(500).json({ error: 'Failed to fetch insights' });
    }
    
    res.json(insights || []);
  } catch (error) {
    console.error('Error in GET /insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/insights/:id/mark-read
router.post('/:id/mark-read', async (req: Request, res: Response) => {
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
    
    const { data: insight, error } = await supabaseAdmin
      .from('insights')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking insight read:', error);
      return res.status(404).json({ error: 'Insight not found' });
    }
    
    res.json(insight);
  } catch (error) {
    console.error('Error in POST /insights/:id/mark-read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/insights/dismiss/:id
router.post('/dismiss/:id', async (req: Request, res: Response) => {
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
    
    const { error } = await supabaseAdmin
      .from('insights')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error dismissing insight:', error);
      return res.status(500).json({ error: 'Failed to dismiss insight' });
    }
    
    res.json({ message: 'Insight dismissed', id });
  } catch (error) {
    console.error('Error in POST /insights/dismiss/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
