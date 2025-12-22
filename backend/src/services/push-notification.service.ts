/**
 * Push Notification Service
 * Handles sending push notifications to subscribed users
 */

import webPush from 'web-push';
import { SupabaseClient } from '@supabase/supabase-js';

// VAPID keys for push notifications
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:noreply@lifelonglearning.com';

// Validate VAPID configuration
const isVapidConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

// Configure web-push
if (isVapidConfigured) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  console.log('Web Push configured successfully');
} else {
  console.warn('VAPID keys not configured. Push notifications will be disabled.');
  console.warn('Generate VAPID keys with: npx web-push generate-vapid-keys');
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  url?: string;
}

export interface SendNotificationResult {
  success: boolean;
  error?: string;
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload,
  supabase: SupabaseClient
): Promise<SendNotificationResult> {
  if (!isVapidConfigured) {
    return {
      success: false,
      error: 'Push notifications not configured - VAPID keys missing',
    };
  }

  try {
    // Get user's active push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return {
        success: false,
        error: 'No active subscriptions found for user',
      };
    }

    // Send notification to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: subscription.keys as { p256dh: string; auth: string },
          };

          await webPush.sendNotification(
            pushSubscription,
            JSON.stringify(payload),
            {
              TTL: 3600, // 1 hour
            }
          );

          return { success: true, subscription: subscription.id };
        } catch (error) {
          console.error('Failed to send to subscription:', error);
          
          // If subscription is invalid, deactivate it
          if ((error as { statusCode?: number }).statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id);
          }
          
          throw error;
        }
      })
    );

    // Log notification
    await logNotification(userId, payload, supabase);

    const successCount = results.filter((r) => r.status === 'fulfilled').length;

    return {
      success: successCount > 0,
      error: successCount === 0 ? 'Failed to send to all subscriptions' : undefined,
    };
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendBulkPushNotifications(
  userIds: string[],
  payload: NotificationPayload,
  supabase: SupabaseClient
): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendPushNotification(userId, payload, supabase))
  );

  const success = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - success;

  return { success, failed };
}

/**
 * Send lesson reminder notification
 */
export async function sendLessonReminder(
  userId: string,
  lessonTitle: string,
  supabase: SupabaseClient
): Promise<SendNotificationResult> {
  const payload: NotificationPayload = {
    title: '📚 Lesson Reminder',
    body: `Don't forget to complete: ${lessonTitle}`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'lesson-reminder',
    data: {
      type: 'lesson_reminder',
      url: '/dashboard',
    },
    actions: [
      {
        action: 'view',
        title: 'View Lesson',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    url: '/dashboard',
  };

  return sendPushNotification(userId, payload, supabase);
}

/**
 * Send new content notification
 */
export async function sendNewContentNotification(
  userId: string,
  contentTitle: string,
  contentId: string,
  supabase: SupabaseClient
): Promise<SendNotificationResult> {
  const payload: NotificationPayload = {
    title: '🎉 New Content Available',
    body: `Check out: ${contentTitle}`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'new-content',
    data: {
      type: 'new_content',
      contentId,
      url: `/content/${contentId}`,
    },
    actions: [
      {
        action: 'view',
        title: 'View Now',
      },
      {
        action: 'save',
        title: 'Save for Later',
      },
    ],
    url: `/content/${contentId}`,
  };

  return sendPushNotification(userId, payload, supabase);
}

/**
 * Send achievement notification
 */
export async function sendAchievementNotification(
  userId: string,
  achievementTitle: string,
  supabase: SupabaseClient
): Promise<SendNotificationResult> {
  const payload: NotificationPayload = {
    title: '🏆 Achievement Unlocked!',
    body: achievementTitle,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'achievement',
    data: {
      type: 'achievement',
      url: '/dashboard',
    },
    requireInteraction: true,
    url: '/dashboard',
  };

  return sendPushNotification(userId, payload, supabase);
}

/**
 * Send insight notification
 */
export async function sendInsightNotification(
  userId: string,
  insightMessage: string,
  supabase: SupabaseClient
): Promise<SendNotificationResult> {
  const payload: NotificationPayload = {
    title: '💡 New Insight',
    body: insightMessage,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'insight',
    data: {
      type: 'insight',
      url: '/dashboard',
    },
    url: '/dashboard',
  };

  return sendPushNotification(userId, payload, supabase);
}

/**
 * Log notification to database
 */
async function logNotification(
  userId: string,
  payload: NotificationPayload,
  supabase: SupabaseClient
): Promise<void> {
  try {
    await supabase.from('notification_logs').insert({
      user_id: userId,
      notification_type: 'push',
      category: (payload.data?.type as string) || 'general',
      title: payload.title,
      message: payload.body,
      sent_at: new Date().toISOString(),
      delivered: true,
      metadata: payload.data || {},
    });
  } catch (error) {
    console.error('Failed to log notification:', error);
  }
}

/**
 * Check if user can receive notifications based on preferences
 */
export async function canReceiveNotifications(
  userId: string,
  notificationType: string,
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('notifications_enabled, push_enabled, notification_time_start, notification_time_end, notification_types, timezone, quiet_days')
      .eq('user_id', userId)
      .single();

    if (!preferences || !preferences.notifications_enabled || !preferences.push_enabled) {
      return false;
    }

    // Check if this notification type is enabled
    const notificationTypes = preferences.notification_types as Record<string, boolean>;
    if (notificationTypes && notificationTypes[notificationType] === false) {
      return false;
    }

    // Check if current time is within allowed window
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Check quiet days
    if (preferences.quiet_days && preferences.quiet_days.includes(currentDay.toLowerCase())) {
      return false;
    }

    // Check time window (simplified - should account for timezone)
    const currentTime = now.toTimeString().slice(0, 8);
    if (currentTime < preferences.notification_time_start || currentTime > preferences.notification_time_end) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to check notification permissions:', error);
    return false;
  }
}

/**
 * Track notification click
 */
export async function trackNotificationClick(
  notificationId: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    await supabase
      .from('notification_logs')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq('id', notificationId);
  } catch (error) {
    console.error('Failed to track notification click:', error);
  }
}
