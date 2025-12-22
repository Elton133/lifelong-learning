/**
 * PWA Utility Module
 * Handles service worker registration, PWA installation, and related utilities
 */

let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // SSR guard
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this environment');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    
    console.log('Service Worker registered successfully:', registration.scope);
    
    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('New service worker available');
            // Optionally show update notification to user
            if (typeof window !== 'undefined' && window.confirm('New version available! Reload to update?')) {
              window.location.reload();
            }
          }
        });
      }
    });
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  // SSR guard
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker not available');
    return false;
  }
  
  const registration = await navigator.serviceWorker.ready;
  return await registration.unregister();
}

/**
 * Check if PWA is already installed
 */
export function isPWAInstalled(): boolean {
  // SSR guard
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check if running as iOS PWA
  if ((navigator as Navigator & { standalone?: boolean }).standalone) {
    return true;
  }
  
  return false;
}

/**
 * Setup PWA install prompt listener
 */
export function setupInstallPrompt(
  onPromptAvailable: (prompt: BeforeInstallPromptEvent) => void
): void {
  // SSR guard
  if (typeof window === 'undefined') {
    console.warn('setupInstallPrompt called on server-side, skipping');
    return;
  }
  
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent the default prompt
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    // Notify that install prompt is available
    onPromptAvailable(deferredPrompt);
  });
  
  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
    
    // Track installation
    trackPWAInstall();
  });
}

/**
 * Show the PWA install prompt
 */
export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | null> {
  if (!deferredPrompt) {
    console.warn('Install prompt not available');
    return null;
  }
  
  // Show the install prompt
  await deferredPrompt.prompt();
  
  // Wait for user choice
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User ${outcome} the install prompt`);
  
  // Clear the deferred prompt
  deferredPrompt = null;
  
  return outcome;
}

/**
 * Track PWA installation
 */
async function trackPWAInstall(): Promise<void> {
  try {
    const platform = getPlatform();
    
    await fetch('/api/pwa/track-install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    });
  } catch (error) {
    console.error('Failed to track PWA installation:', error);
  }
}

/**
 * Get current platform
 */
function getPlatform(): string {
  // SSR guard
  if (typeof navigator === 'undefined') {
    return 'server';
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) {
    return 'android';
  } else if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/windows/.test(userAgent)) {
    return 'windows';
  } else if (/mac/.test(userAgent)) {
    return 'macos';
  } else if (/linux/.test(userAgent)) {
    return 'linux';
  }
  
  return 'desktop';
}

/**
 * Clear all caches
 */
export async function clearCaches(): Promise<void> {
  // SSR guard
  if (typeof window === 'undefined' || !('caches' in window)) {
    console.warn('Cache API not available');
    return;
  }
  
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('All caches cleared');
}

/**
 * Send message to service worker
 */
export function sendMessageToSW(message: unknown): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker not available');
    return;
  }
  
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  // SSR guard - assume online on server
  if (typeof navigator === 'undefined') {
    return true;
  }
  
  return navigator.onLine;
}

/**
 * Setup online/offline listeners
 */
export function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  // SSR guard
  if (typeof window === 'undefined') {
    console.warn('setupNetworkListeners called on server-side, skipping');
    return () => {}; // Return empty cleanup function
  }
  
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
