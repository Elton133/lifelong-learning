import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase.client';

const router = Router();

// Helper to generate AI-powered playlist based on user context
async function generatePersonalizedPlaylist(userId: string, goalId?: string): Promise<string[]> {
  if (!supabaseAdmin) return [];
  
  try {
    // Get user profile for personalization
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('learning_style, career_goals')
      .eq('id', userId)
      .single();
    
    // Get user skills to identify areas for improvement
    const { data: userSkills } = await supabaseAdmin
      .from('user_skills')
      .select('skill_id, mastery_level')
      .eq('user_id', userId)
      .order('mastery_level', { ascending: true });
    
    // Build intelligent content query based on user context
    let query = supabaseAdmin.from('learning_content').select('id, skill_ids, difficulty, content_type, estimated_duration');
    
    // Prioritize content for skills with lower mastery
    const lowMasterySkillIds = userSkills
      ?.filter(s => s.mastery_level < 50)
      .map(s => s.skill_id) || [];
    
    if (lowMasterySkillIds.length > 0) {
      query = query.overlaps('skill_ids', lowMasterySkillIds);
    }
    
    // Limit duration for daily consumption
    query = query.lte('estimated_duration', 30);
    
    // Prefer content type based on learning style
    if (profile?.learning_style === 'visual' || profile?.learning_style === 'video') {
      query = query.eq('content_type', 'video');
    } else if (profile?.learning_style === 'hands-on') {
      query = query.in('content_type', ['interactive', 'sandbox']);
    }
    
    query = query.limit(5);
    
    const { data: contents } = await query;
    
    return contents?.map(c => c.id) || [];
  } catch (error) {
    console.error('Error generating personalized playlist:', error);
    return [];
  }
}

// GET /api/playlists/daily
router.get('/daily', async (req: Request, res: Response) => {
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
    
    // Get today's playlist
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let { data: playlist, error } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .eq('playlist_type', 'daily')
      .eq('is_active', true)
      .gte('created_at', today.toISOString())
      .single();
    
    // If no playlist exists for today, generate one
    if (error || !playlist) {
      const contentIds = await generatePersonalizedPlaylist(user.id);
      
      const { data: newPlaylist, error: insertError } = await supabaseAdmin
        .from('playlists')
        .insert({
          user_id: user.id,
          title: "Today's Learning Path",
          description: 'AI-personalized content based on your skills and preferences',
          content_ids: contentIds,
          playlist_type: 'daily',
          is_active: true,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating playlist:', insertError);
        return res.status(500).json({ error: 'Failed to create playlist' });
      }
      
      playlist = newPlaylist;
    }
    
    // Get content for the playlist
    if (playlist.content_ids && playlist.content_ids.length > 0) {
      const { data: contents } = await supabaseAdmin
        .from('learning_content')
        .select('*')
        .in('id', playlist.content_ids);
      
      return res.json({
        ...playlist,
        contents: contents || [],
      });
    }
    
    res.json({ ...playlist, contents: [] });
  } catch (error) {
    console.error('Error in GET /playlists/daily:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/playlists/recommended
router.get('/recommended', async (req: Request, res: Response) => {
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
    
    const { data: playlists, error } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching recommended playlists:', error);
      return res.status(500).json({ error: 'Failed to fetch playlists' });
    }
    
    res.json(playlists || []);
  } catch (error) {
    console.error('Error in GET /playlists/recommended:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/playlists/:id
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
    
    const { data: playlist, error } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching playlist:', error);
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    // Get content for the playlist
    if (playlist.content_ids && playlist.content_ids.length > 0) {
      const { data: contents } = await supabaseAdmin
        .from('learning_content')
        .select('*')
        .in('id', playlist.content_ids);
      
      return res.json({
        ...playlist,
        contents: contents || [],
      });
    }
    
    res.json({ ...playlist, contents: [] });
  } catch (error) {
    console.error('Error in GET /playlists/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/playlists/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { goalId } = req.body;
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
    
    const contentIds = await generatePersonalizedPlaylist(user.id, goalId);
    
    const { data: playlist, error } = await supabaseAdmin
      .from('playlists')
      .insert({
        user_id: user.id,
        title: goalId ? 'Goal-based Learning Path' : 'AI-Generated Daily Playlist',
        description: 'Personalized learning content selected just for you',
        content_ids: contentIds,
        playlist_type: goalId ? 'goal-based' : 'daily',
        is_active: true,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error generating playlist:', error);
      return res.status(500).json({ error: 'Failed to generate playlist' });
    }
    
    // Get content for the playlist
    if (playlist.content_ids && playlist.content_ids.length > 0) {
      const { data: contents } = await supabaseAdmin
        .from('learning_content')
        .select('*')
        .in('id', playlist.content_ids);
      
      return res.json({
        ...playlist,
        contents: contents || [],
      });
    }
    
    res.json({ ...playlist, contents: [] });
  } catch (error) {
    console.error('Error in POST /playlists/generate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
