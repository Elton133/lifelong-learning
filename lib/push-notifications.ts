/**
 * Push Notification Utility Module
 * Handles push notification subscriptions and permissions
 */

import { supabase } from './supabase';

/**
 * Extended NotificationOptions to include vibrate pattern
 * The vibrate property is part of the Notification API but may not be in all TypeScript definitions
 */
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[] | number;
}

// VAPID public key - should be set in environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

if (!VAPID_PUBLIC_KEY && typeof window !== 'undefined') {
  console.warn('[Push Notifications] VAPID public key is not configured. Push notifications will be disabled.');
}

/**
 * Convert VAPID key from base64 to Uint8Array
 * Returns a Uint8Array with ArrayBuffer (not ArrayBufferLike) for Web API compatibility
 * 
 * Note: TypeScript's lib.dom.d.ts has strict ArrayBuffer vs ArrayBufferLike distinction.
 * At runtime, Uint8Array always has ArrayBuffer as its buffer type, but TypeScript infers
 * it as ArrayBufferLike. The type assertion at the call site is safe and necessary.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  if (typeof window === 'undefined') {
    throw new Error('Push notifications are only supported in the browser');
  }

  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  // Create a new Uint8Array directly from length, which will have ArrayBuffer as buffer type
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}


/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  // SSR guard
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  // SSR guard
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  // SSR guard
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }
  
  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Convert VAPID key - Uint8Array created directly has ArrayBuffer as buffer type
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      // Create new subscription
      // Type assertion (as BufferSource) is necessary due to TypeScript's strict ArrayBuffer vs
      // ArrayBufferLike distinction. At runtime, Uint8Array.buffer is always ArrayBuffer, making
      // this assertion safe and spec-compliant per the Web Push API specification.
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });
      
      console.log('Push subscription created:', subscription);
    }
    
    // Save subscription to backend
    await savePushSubscription(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const successful = await subscription.unsubscribe();
      
      if (successful) {
        // Remove subscription from backend
        await removePushSubscription(subscription.endpoint);
      }
      
      return successful;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Failed to get push subscription:', error);
    return null;
  }
}

/**
 * Save push subscription to backend
 */
async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // SSR guard for navigator
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'server';
    
    const subscriptionData = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      keys: subscription.toJSON().keys || {},
      user_agent: userAgent,
      is_active: true,
    };
    
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id,endpoint',
      });
    
    if (error) throw error;
    
    console.log('Push subscription saved to backend');
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    throw error;
  }
}

/**
 * Remove push subscription from backend
 */
async function removePushSubscription(endpoint: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);
    
    if (error) throw error;
    
    console.log('Push subscription removed from backend');
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    throw error;
  }
}

/**
 * Show a local notification (doesn't require push subscription)
 */
export async function showLocalNotification(
  title: string,
  options?: ExtendedNotificationOptions
): Promise<void> {
  // SSR guard
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return;
    }
  }
  
  // Additional guard for service worker
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker not available');
    return;
  }
  
  const registration = await navigator.serviceWorker.ready;
  // Type assertion is necessary because ExtendedNotificationOptions includes 'vibrate' which
  // is a valid Notifications API property but may not be in all TypeScript lib.dom.d.ts versions.
  // At runtime, the browser's showNotification accepts all valid NotificationOptions including vibrate.
  await registration.showNotification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    ...options,
  } as NotificationOptions);
}

/**
 * Test push notification
 */
export async function testPushNotification(): Promise<void> {
  await showLocalNotification('Test Notification', {
    body: 'This is a test notification from Lifelong Learning Platform',
    tag: 'test-notification',
    requireInteraction: false,
  });
}
