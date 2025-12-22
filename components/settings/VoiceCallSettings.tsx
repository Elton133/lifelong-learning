'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function VoiceCallSettings() {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<Record<string, unknown>>({
    calls_enabled: false,
    call_time_start: '10:00:00',
    call_time_end: '18:00:00',
    call_frequency: 'never',
    preferred_call_duration: 60,
    quiet_days: [],
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await apiClient.get('/api/calls/preferences');
      if (response.data) {
        setPreferences(response.data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Record<string, unknown>) => {
    try {
      await apiClient.patch('/api/calls/preferences', updates);
      setPreferences({ ...preferences, ...updates });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const toggleQuietDay = async (day: string) => {
    const quietDays = (preferences.quiet_days as string[]) || [];
    const updated = quietDays.includes(day)
      ? quietDays.filter(d => d !== day)
      : [...quietDays, day];
    
    await updatePreferences({ quiet_days: updated });
  };

  if (loading) {
    return <div className="text-center py-8">Loading preferences...</div>;
  }

  const quietDays = (preferences.quiet_days as string[]) || [];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Voice Calls</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.calls_enabled as boolean}
              onChange={(e) => updatePreferences({ calls_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {!(preferences.calls_enabled as boolean) && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              📞 Enable voice calls to receive personalized learning reminders and micro-lessons via phone
            </p>
          </div>
        )}

        {(preferences.calls_enabled as boolean) && (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Voice calls are enabled. You'll receive calls based on your preferences below.
              </p>
            </div>
          </div>
        )}
      </div>

      {(preferences.calls_enabled as boolean) && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Call Frequency</h3>
            
            <div className="space-y-2">
              {['never', 'daily', 'weekly', 'biweekly'].map((freq) => (
                <label key={freq} className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value={freq}
                    checked={preferences.call_frequency === freq}
                    onChange={(e) => updatePreferences({ call_frequency: e.target.value })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm capitalize">{freq}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Call Duration</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Preferred Duration (seconds)
              </label>
              <select
                value={preferences.preferred_call_duration as number}
                onChange={(e) => updatePreferences({ preferred_call_duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={30}>30 seconds - Quick tip</option>
                <option value={60}>60 seconds - Brief lesson</option>
                <option value={90}>90 seconds - Standard lesson</option>
                <option value={120}>2 minutes - Extended lesson</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Time Window</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={(preferences.call_time_start as string).slice(0, 5)}
                  onChange={(e) => updatePreferences({ call_time_start: `${e.target.value}:00` })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={(preferences.call_time_end as string).slice(0, 5)}
                  onChange={(e) => updatePreferences({ call_time_end: `${e.target.value}:00` })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Calls will only be made within this time window
            </p>
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
              No calls will be made on selected days
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>🔒 Your phone number is never shared with third parties</p>
              <p>🔐 All calls are encrypted and secure via Twilio</p>
              <p>📵 You can opt-out anytime by disabling voice calls</p>
              <p>🎯 Calls are personalized based on your learning preferences</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
