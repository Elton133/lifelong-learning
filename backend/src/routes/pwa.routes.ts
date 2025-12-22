import express from 'express';
import { authenticateRequest } from '../utils/auth';
import { supabaseAdmin } from '../utils/supabase';

const router = express.Router();

/**
 * Track PWA installation
 * POST /api/pwa/track-install
 */
router.post('/track-install', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const { platform } = req.body;

    const { data, error } = await supabaseAdmin!
      .from('pwa_installations')
      .insert({
        user_id: user.id,
        platform: platform || 'unknown',
        installed_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error tracking PWA installation:', error);
    res.status(500).json({ error: 'Failed to track installation' });
  }
});

/**
 * Update PWA last used timestamp
 * POST /api/pwa/track-usage
 */
router.post('/track-usage', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const { error } = await supabaseAdmin!
      .from('pwa_installations')
      .update({
        last_used_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking PWA usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

/**
 * Get PWA installation status
 * GET /api/pwa/status
 */
router.get('/status', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabaseAdmin!
      .from('pwa_installations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('installed_at', { ascending: false });

    if (error) throw error;

    res.json({
      installed: (data && data.length > 0),
      installations: data,
    });
  } catch (error) {
    console.error('Error fetching PWA status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export default router;
