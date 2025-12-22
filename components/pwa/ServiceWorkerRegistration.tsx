'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa';

/**
 * Component to register service worker on app load
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
  }, []);

  return null; // This component doesn't render anything
}
