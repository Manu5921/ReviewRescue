// Background Service Worker for Review Rescue Extension

import { googleAuthService } from './auth';
import {
  storageService,
  reviewCacheService,
  sessionService,
  preferencesService,
} from './storage';

// Message types
interface Message {
  type: string;
  data?: any;
}

interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Service worker lifecycle handlers

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Review Rescue extension installed:', details.reason);

  if (details.reason === 'install') {
    // First time installation
    await handleFirstInstall();
  } else if (details.reason === 'update') {
    // Extension updated
    await handleUpdate(details.previousVersion);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('Review Rescue extension started');
  await checkAndScheduleSync();
});

// Message passing between popup and background

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  handleMessage(message)
    .then((response) => sendResponse(response))
    .catch((error) => {
      console.error('Message handler error:', error);
      sendResponse({
        success: false,
        error: error.message || 'Unknown error',
      });
    });

  // Return true to indicate async response
  return true;
});

// Message handler
async function handleMessage(message: Message): Promise<MessageResponse> {
  console.log('Received message:', message.type);

  try {
    switch (message.type) {
      case 'AUTH_LOGIN':
        const token = await googleAuthService.authenticate();
        return { success: true, data: { token } };

      case 'AUTH_LOGOUT':
        await googleAuthService.logout();
        return { success: true };

      case 'AUTH_CHECK':
        const isAuth = await googleAuthService.isAuthenticated();
        return { success: true, data: { isAuthenticated: isAuth } };

      case 'GET_SESSION':
        const session = await sessionService.getSession();
        return { success: true, data: session };

      case 'GET_PREFERENCES':
        const prefs = await preferencesService.getPreferences();
        return { success: true, data: prefs };

      case 'UPDATE_PREFERENCES':
        await preferencesService.updatePreferences(message.data);
        return { success: true };

      case 'GET_REVIEWS':
        const reviews = await reviewCacheService.getCachedReviews();
        return { success: true, data: reviews };

      case 'GET_STORAGE_STATS':
        const stats = await storageService.getStorageStats();
        return { success: true, data: stats };

      case 'SYNC_REVIEWS':
        // This will be implemented in sync.ts
        return { success: false, error: 'Sync not yet implemented' };

      case 'GENERATE_INSIGHTS':
        // This will be implemented in AI insights phase
        return { success: false, error: 'Insights not yet implemented' };

      case 'EXPORT_REVIEWS':
        // This will be implemented in export phase
        return { success: false, error: 'Export not yet implemented' };

      default:
        return { success: false, error: `Unknown message type: ${message.type}` };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Message handling failed',
    };
  }
}

// First install handler
async function handleFirstInstall(): Promise<void> {
  console.log('First time installation - initializing defaults');

  // Initialize default preferences
  const defaultPrefs = await preferencesService.getPreferences();
  await preferencesService.setPreferences(defaultPrefs);

  // Open welcome page (optional)
  // chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
}

// Update handler
async function handleUpdate(previousVersion?: string): Promise<void> {
  console.log(`Extension updated from ${previousVersion} to ${chrome.runtime.getManifest().version}`);

  // Handle data migrations if needed
  // For now, no migrations needed
}

// Sync scheduling
async function checkAndScheduleSync(): Promise<void> {
  const prefs = await preferencesService.getPreferences();

  if (prefs.auto_sync_enabled) {
    const session = await sessionService.getSession();

    // Check if we should sync
    if (session?.last_sync_at) {
      const lastSync = new Date(session.last_sync_at);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceSync >= prefs.sync_interval_hours) {
        // Trigger sync (will be implemented in sync.ts)
        console.log('Auto-sync triggered');
      }
    }
  }
}

// Global error handler
self.addEventListener('error', (event) => {
  console.error('Unhandled error in service worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in service worker:', event.reason);
});

console.log('Review Rescue service worker loaded');
