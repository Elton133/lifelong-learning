import express from 'express';
import { authenticateRequest } from '../utils/auth';
import { supabaseAdmin } from '../utils/supabase';
import { trackNotificationClick } from '../services/push-notification.service';

const router = express.Router();

/**
 * Subscribe to push notifications
 * POST /api/notifications/subscribe
 */
router.post('/subscribe', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const { endpoint, keys, userAgent } = req.body;

    if (!endpoint || !keys) {
      res.status(400).json({ error: 'Missing subscription data' });
      return;
    }

    const { data, error } = await supabaseAdmin!
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint,
        keys,
        user_agent: userAgent,
        is_active: true,
      }, {
        onConflict: 'user_id,endpoint',
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

/**
 * Unsubscribe from push notifications
 * POST /api/notifications/unsubscribe
 */
router.post('/unsubscribe', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({ error: 'Missing endpoint' });
      return;
    }

    const { error } = await supabaseAdmin!
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

/**
 * Get user's notification preferences
 * GET /api/notifications/preferences
 */
router.get('/preferences', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabaseAdmin!
      .from('user_preferences')
      .select('notifications_enabled, push_enabled, notification_time_start, notification_time_end, notification_types, quiet_days')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * Update notification preferences
 * PATCH /api/notifications/preferences
 */
router.patch('/preferences', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const updates = req.body;

    const { data, error } = await supabaseAdmin!
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * Get notification history
 * GET /api/notifications/history
 */
router.get('/history', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error } = await supabaseAdmin!
      .from('notification_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * Track notification click
 * POST /api/notifications/track-click
 */
router.post('/track-click', async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      res.status(400).json({ error: 'Missing notificationId' });
      return;
    }

    await trackNotificationClick(notificationId, supabaseAdmin!);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking notification click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

export default router;
