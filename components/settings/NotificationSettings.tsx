'use client';

import { useState, useEffect } from 'react';
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  requestNotificationPermission,
  getNotificationPermission,
  isPushNotificationSupported,
  testPushNotification
} from '@/lib/push-notifications';
import { apiClient } from '@/lib/api';
import type { UserPreferences } from '@/types/database';

type NotificationPreferences = Pick<
  UserPreferences,
  'notifications_enabled' | 'push_enabled' | 'notification_time_start' | 
  'notification_time_end' | 'notification_types' | 'quiet_days'
>;

export default function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notifications_enabled: true,
    push_enabled: true,
    notification_time_start: '09:00:00',
    notification_time_end: '21:00:00',
    notification_types: {
      lesson_reminders: true,
      new_content: true,
      achievements: true,
      insights: true,
    },
    quiet_days: [],
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    loadPreferences();
    setPermission(getNotificationPermission());
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await apiClient.get('/api/notifications/preferences');
      if (response.data) {
        setPreferences(response.data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      await apiClient.patch('/api/notifications/preferences', updates);
      setPreferences({ ...preferences, ...updates });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleEnableNotifications = async () => {
    if (!isPushNotificationSupported()) {
      alert('Push notifications are not supported in this browser');
      return;
    }

    const perm = await requestNotificationPermission();
    setPermission(perm);

    if (perm === 'granted') {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        setSubscribed(true);
        await updatePreferences({ push_enabled: true });
      }
    }
  };

  const handleDisableNotifications = async () => {
    const success = await unsubscribeFromPushNotifications();
    if (success) {
      setSubscribed(false);
      await updatePreferences({ push_enabled: false });
    }
  };

  const handleTestNotification = async () => {
    try {
      await testPushNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const toggleNotificationType = async (type: keyof UserPreferences['notification_types'], enabled: boolean) => {
    const updated: Partial<NotificationPreferences> = {
      notification_types: {
        ...preferences.notification_types,
        [type]: enabled,
      },
    };
    await updatePreferences(updated);
  };

  const toggleQuietDay = async (day: string) => {
    const quietDays = preferences.quiet_days || [];
    const updated: Partial<NotificationPreferences> = {
      quiet_days: quietDays.includes(day)
        ? quietDays.filter(d => d !== day)
        : [...quietDays, day],
    };
    
    await updatePreferences(updated);
  };

  if (loading) {
    return <div className="text-center py-8">Loading preferences...</div>;
  }

  const notificationTypes = preferences.notification_types;
  const quietDays = preferences.quiet_days || [];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
        
        {permission === 'denied' && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}

        {permission === 'default' && (
          <div className="mb-4">
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Enable Push Notifications
            </button>
          </div>
        )}

        {permission === 'granted' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Push Notifications</span>
              <button
                onClick={subscribed ? handleDisableNotifications : handleEnableNotifications}
                className={`px-4 py-2 rounded-md transition-colors ${
                  subscribed
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {subscribed ? 'Disable' : 'Enable'}
              </button>
            </div>

            {subscribed && (
              <button
                onClick={handleTestNotification}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Send Test Notification
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Notification Types</h3>
        
        <div className="space-y-3">
          {Object.entries(notificationTypes).map(([type, enabled]) => (
            <label key={type} className="flex items-center justify-between">
              <span className="text-sm capitalize">
                {type.replace(/_/g, ' ')}
              </span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => toggleNotificationType(type as keyof UserPreferences['notification_types'], e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Time Window</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <input
              type="time"
              value={preferences.notification_time_start.slice(0, 5)}
              onChange={(e) => updatePreferences({ notification_time_start: `${e.target.value}:00` })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <input
              type="time"
              value={preferences.notification_time_end.slice(0, 5)}
              onChange={(e) => updatePreferences({ notification_time_end: `${e.target.value}:00` })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quiet Days</h3>
        
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => toggleQuietDay(day)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                quietDays.includes(day)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          No notifications will be sent on selected days
        </p>
      </div>
    </div>
  );
}
