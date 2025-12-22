/**
 * Event Trigger Service
 * Handles event-driven notifications and calls based on user activity
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { sendLessonReminder, sendNewContentNotification, sendInsightNotification, canReceiveNotifications } from './push-notification.service';
import { makeVoiceCall, canReceiveCalls } from './twilio.service';

export interface TriggerContext {
  userId: string;
  supabase: SupabaseClient;
}

/**
 * Check for inactive users and send reminders
 */
export async function checkInactiveUsers(supabase: SupabaseClient): Promise<void> {
  try {
    // Find users who haven't completed a session in the last 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: inactiveUsers } = await supabase
      .from('profiles')
      .select('id, full_name')
      .not('id', 'in', 
        supabase
          .from('learning_sessions')
          .select('user_id')
          .gte('started_at', twoDaysAgo.toISOString())
      );

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return;
    }

    console.log(`Found ${inactiveUsers.length} inactive users`);

    // Send reminders to inactive users
    for (const user of inactiveUsers) {
      const canNotify = await canReceiveNotifications(user.id, 'lesson_reminders', supabase);
      
      if (canNotify) {
        await sendLessonReminder(
          user.id,
          "It's been a while! Continue your learning journey",
          supabase
        );

        // Schedule a call if user has calls enabled
        const canCall = await canReceiveCalls(user.id, supabase);
        if (canCall) {
          await scheduleInactivityCall(user.id, supabase);
        }
      }
    }
  } catch (error) {
    console.error('Failed to check inactive users:', error);
  }
}

/**
 * Schedule an inactivity reminder call
 */
async function scheduleInactivityCall(userId: string, supabase: SupabaseClient): Promise<void> {
  try {
    // Get user's phone number and preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('call_time_start')
      .eq('user_id', userId)
      .single();

    if (!profile || !preferences) {
      return;
    }

    // Schedule call for next day at preferred time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = preferences.call_time_start.split(':');
    tomorrow.setHours(parseInt(hours), parseInt(minutes), 0);

    await supabase.from('scheduled_events').insert({
      user_id: userId,
      event_type: 'call',
      category: 'inactivity',
      scheduled_for: tomorrow.toISOString(),
      status: 'pending',
      payload: {
        callType: 'reminder',
        message: `Hi ${profile.full_name}! We noticed you haven't been active on your learning platform. Your personalized lessons are waiting for you.`,
      },
    });

    console.log(`Scheduled inactivity call for user ${userId}`);
  } catch (error) {
    console.error('Failed to schedule inactivity call:', error);
  }
}

/**
 * Notify users about new content matching their interests
 */
export async function notifyNewContent(
  contentId: string,
  contentTitle: string,
  contentCategory: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    // Find users interested in this category
    const { data: interestedUsers } = await supabase
      .from('profiles')
      .select('id, full_name, interests')
      .contains('interests', [contentCategory]);

    if (!interestedUsers || interestedUsers.length === 0) {
      return;
    }

    console.log(`Found ${interestedUsers.length} users interested in ${contentCategory}`);

    // Send notifications
    for (const user of interestedUsers) {
      const canNotify = await canReceiveNotifications(user.id, 'new_content', supabase);
      
      if (canNotify) {
        await sendNewContentNotification(user.id, contentTitle, contentId, supabase);
      }
    }
  } catch (error) {
    console.error('Failed to notify about new content:', error);
  }
}

/**
 * Send daily micro-lesson calls
 */
export async function sendDailyMicroLessons(supabase: SupabaseClient): Promise<void> {
  try {
    // Get users with daily call frequency enabled
    const { data: users } = await supabase
      .from('user_preferences')
      .select('user_id, call_time_start')
      .eq('calls_enabled', true)
      .eq('call_frequency', 'daily');

    if (!users || users.length === 0) {
      return;
    }

    console.log(`Scheduling daily micro-lessons for ${users.length} users`);

    for (const userPref of users) {
      // Get user's next lesson
      const { data: playlist } = await supabase
        .from('playlists')
        .select('content_ids')
        .eq('user_id', userPref.user_id)
        .eq('playlist_type', 'daily')
        .eq('is_active', true)
        .single();

      if (!playlist || !playlist.content_ids || playlist.content_ids.length === 0) {
        continue;
      }

      const contentId = playlist.content_ids[0];

      // Get content details
      const { data: content } = await supabase
        .from('learning_content')
        .select('title, description')
        .eq('id', contentId)
        .single();

      if (!content) {
        continue;
      }

      // Schedule micro-lesson call
      const today = new Date();
      const [hours, minutes] = userPref.call_time_start.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0);

      await supabase.from('scheduled_events').insert({
        user_id: userPref.user_id,
        event_type: 'call',
        category: 'micro_lesson',
        scheduled_for: today.toISOString(),
        status: 'pending',
        payload: {
          callType: 'micro_lesson',
          contentId: contentId,
          lessonContent: `Today's lesson: ${content.title}. ${content.description}`,
        },
      });
    }

    console.log('Daily micro-lessons scheduled');
  } catch (error) {
    console.error('Failed to send daily micro-lessons:', error);
  }
}

/**
 * Process scheduled events (calls and notifications)
 */
export async function processScheduledEvents(supabase: SupabaseClient): Promise<void> {
  try {
    const now = new Date();

    // Get pending events that are due
    const { data: events } = await supabase
      .from('scheduled_events')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString())
      .limit(50);

    if (!events || events.length === 0) {
      return;
    }

    console.log(`Processing ${events.length} scheduled events`);

    for (const event of events) {
      // Mark as processing
      await supabase
        .from('scheduled_events')
        .update({ status: 'processing' })
        .eq('id', event.id);

      try {
        if (event.event_type === 'call') {
          await processScheduledCall(event, supabase);
        } else if (event.event_type === 'notification') {
          await processScheduledNotification(event, supabase);
        }

        // Mark as completed
        await supabase
          .from('scheduled_events')
          .update({ 
            status: 'completed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', event.id);
      } catch (error) {
        console.error(`Failed to process event ${event.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('scheduled_events')
          .update({ 
            status: 'failed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', event.id);
      }
    }
  } catch (error) {
    console.error('Failed to process scheduled events:', error);
  }
}

/**
 * Process a scheduled call
 */
async function processScheduledCall(
  event: { id: string; user_id: string; payload: Record<string, unknown> },
  supabase: SupabaseClient
): Promise<void> {
  const payload = event.payload;
  
  // Get user's phone number (would need to be added to profiles table)
  // For now, we'll skip the actual call but log it
  console.log(`Would make call to user ${event.user_id}:`, payload);
  
  // In production, you would:
  // 1. Get phone number from user profile
  // 2. Call makeVoiceCall with appropriate parameters
  // Example:
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('phone_number')
  //   .eq('id', event.user_id)
  //   .single();
  //
  // if (profile?.phone_number) {
  //   await makeVoiceCall({
  //     userId: event.user_id,
  //     phoneNumber: profile.phone_number,
  //     callType: payload.callType as 'reminder' | 'micro_lesson',
  //     message: payload.message as string,
  //     contentId: payload.contentId as string | undefined,
  //   }, supabase);
  // }
}

/**
 * Process a scheduled notification
 */
async function processScheduledNotification(
  event: { id: string; user_id: string; category: string | null; payload: Record<string, unknown> },
  supabase: SupabaseClient
): Promise<void> {
  const payload = event.payload;
  const category = event.category || 'general';
  
  // Check if user can receive this notification
  const canNotify = await canReceiveNotifications(event.user_id, category, supabase);
  
  if (!canNotify) {
    console.log(`User ${event.user_id} cannot receive notifications at this time`);
    return;
  }

  // Send based on category
  if (category === 'lesson_reminders') {
    await sendLessonReminder(
      event.user_id,
      payload.message as string || 'You have pending lessons',
      supabase
    );
  } else if (category === 'insights') {
    await sendInsightNotification(
      event.user_id,
      payload.message as string || 'New insight available',
      supabase
    );
  }
}

/**
 * Check for goal achievements and send notifications
 */
export async function checkGoalAchievements(supabase: SupabaseClient): Promise<void> {
  try {
    // This would check user goals and notify them of achievements
    // Implementation depends on goal tracking structure
    console.log('Checking goal achievements...');
  } catch (error) {
    console.error('Failed to check goal achievements:', error);
  }
}
