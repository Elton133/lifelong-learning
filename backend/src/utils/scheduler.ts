/**
 * Scheduler for automated notifications and calls
 * Runs background jobs at specified intervals
 */

import cron from 'node-cron';
import { supabaseAdmin } from '../utils/supabase';
import {
  checkInactiveUsers,
  sendDailyMicroLessons,
  processScheduledEvents,
  checkGoalAchievements,
} from '../services/event-trigger.service';

/**
 * Initialize all scheduled jobs
 */
export function initializeScheduler(): void {
  console.log('Initializing scheduler...');

  // Check for inactive users - runs daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running inactive users check...');
    try {
      await checkInactiveUsers(supabaseAdmin!);
    } catch (error) {
      console.error('Error checking inactive users:', error);
    }
  });

  // Send daily micro-lessons - runs daily at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Scheduling daily micro-lessons...');
    try {
      await sendDailyMicroLessons(supabaseAdmin!);
    } catch (error) {
      console.error('Error sending daily micro-lessons:', error);
    }
  });

  // Process scheduled events - runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Processing scheduled events...');
    try {
      await processScheduledEvents(supabaseAdmin!);
    } catch (error) {
      console.error('Error processing scheduled events:', error);
    }
  });

  // Check goal achievements - runs daily at 6 PM
  cron.schedule('0 18 * * *', async () => {
    console.log('Checking goal achievements...');
    try {
      await checkGoalAchievements(supabaseAdmin!);
    } catch (error) {
      console.error('Error checking goal achievements:', error);
    }
  });

  console.log('Scheduler initialized successfully');
}
