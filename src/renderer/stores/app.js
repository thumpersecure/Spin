/**
 * CONSTANTINE Browser - Production-Ready Svelte State Store
 * Comprehensive state management with resilience, monitoring, and recovery
 */

import { writable, derived, get } from 'svelte/store';
import {
  createLogger,
  perfMonitor,
  validators,
  sanitizeInput,
  memoryManager
} from '../lib/resilience.js';

// ============================================
// Loggers
// ============================================

const storeLogger = createLogger('Store');
const tabLogger = createLogger('Tabs');
const privacyLogger = createLogger('Privacy');

// ============================================
// Constants
// ============================================

const MAX_TABS = 100;
const TAB_PERSIST_DEBOUNCE_MS = 1000;
const MAX_NOTIFICATIONS = 5;
const NOTIFICATION_CLEANUP_INTERVAL = 60000;

// ============================================
// Performance utilities
// ============================================

/**
 * Debounce function for high-frequency updates
 * @param {Function} fn - Function to debounce
 * @param {number} ms - Debounce delay in milliseconds
 */
export function debounce(fn, ms = 16) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Throttle function for rate-limiting
 * @param {Function} fn - Function to throttle
 * @param {number} ms - Throttle interval in milliseconds
 */
export function throttle(fn, ms = 16) {
  let lastCall = 0;
  let timeoutId = null;
  return (...args) => {
    const now = Date.now();
    const timeSince = now - lastCall;

    if (timeSince >= ms) {
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      // Schedule for later if not already scheduled
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, ms - timeSince);
    }
  };
}

/**
 * Request Animation Frame based scheduler for smooth updates
 */
export function rafScheduler() {
  let rafId = null;
  let pending = [];

  const flush = () => {
    const toProcess = pending;
    pending = [];
    rafId = null;

    const endTimer = perfMonitor.startTimer('store.rafFlush');
    toProcess.forEach(fn => {
      try {
        fn();
      } catch (error) {
        storeLogger.error('RAF callback error', { error: error.message });
      }
    });
    endTimer();
  };

  return {
    schedule: (fn) => {
      pending.push(fn);
      if (!rafId) {
        rafId = requestAnimationFrame(flush);
      }
    },
    cancel: () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        pending = [];
      }
    }
  };
}

// Global RAF scheduler instance
const globalScheduler = rafScheduler();

// ============================================
// Tab Store - Production with persistence & monitoring
// ============================================

function createTabStore() {
  const { subscribe, set, update } = writable(new Map());

  // Batching state
  let batchTimeout = null;
  let pendingUpdates = new Map();

  // Persistence state
  let persistTimeout = null;

  // Metrics
  let operationCount = 0;
  let lastPersistTime = 0;

  // Flush batched updates using RAF for smooth rendering
  const flushUpdates = () => {
    if (pendingUpdates.size === 0) return;

    const endTimer = perfMonitor.startTimer('tab.batchUpdate');
    const updateCount = pendingUpdates.size;

    update(tabs => {
      pendingUpdates.forEach((data, tabId) => {
        const existing = tabs.get(tabId);
        if (existing) {
          tabs.set(tabId, {
            ...existing,
            ...data,
            _lastUpdate: Date.now()
          });
        }
      });
      pendingUpdates.clear();
      return new Map(tabs);
    });

    const duration = endTimer();
    if (duration > 16) {
      tabLogger.warn('Slow batch update', { duration: duration.toFixed(2), count: updateCount });
    }

    schedulePersist();
  };

  const scheduleFlush = () => {
    if (batchTimeout) return;
    batchTimeout = requestAnimationFrame(() => {
      batchTimeout = null;
      flushUpdates();
    });
  };

  // Debounced persistence to sessionStorage
  const schedulePersist = () => {
    if (persistTimeout) clearTimeout(persistTimeout);
    persistTimeout = setTimeout(() => {
      persistState();
    }, TAB_PERSIST_DEBOUNCE_MS);
  };

  const persistState = () => {
    try {
      const tabs = get({ subscribe });
      const serializable = Array.from(tabs.entries()).map(([id, tab]) => ({
        id,
        url: tab.url,
        title: tab.title,
        favicon: tab.favicon,
        _createdAt: tab._createdAt
      }));

      // Store in sessionStorage for crash recovery
      sessionStorage.setItem('constantine_tabs', JSON.stringify(serializable));
      lastPersistTime = Date.now();

      tabLogger.debug('Tabs persisted', { count: serializable.length });
    } catch (error) {
      tabLogger.warn('Failed to persist tabs', { error: error.message });
    }
  };

  // Recovery from crash/storage
  const recoverState = () => {
    try {
      const stored = sessionStorage.getItem('constantine_tabs');
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return null;

      tabLogger.info('Recovered tabs from storage', { count: parsed.length });
      return parsed;
    } catch (error) {
      tabLogger.warn('Failed to recover tabs', { error: error.message });
      return null;
    }
  };

  // Create default tab data with metadata
  const createTabData = (tabData = {}) => ({
    title: sanitizeInput(tabData.title || 'New Tab', 'html'),
    favicon: tabData.favicon || null,
    url: tabData.url || '',
    loading: false,
    canGoBack: false,
    canGoForward: false,
    crashed: false,
    unresponsive: false,
    errorCount: 0,
    _createdAt: Date.now(),
    _lastUpdate: Date.now(),
    _lastNavigation: null,
    ...tabData
  });

  return {
    subscribe,
    set,

    /**
     * Add a new tab with validation and limit enforcement
     */
    add: (tabId, tabData = {}) => {
      if (!validators.tabId(tabId)) {
        tabLogger.error('Invalid tab ID', { tabId });
        return false;
      }

      const endTimer = perfMonitor.startTimer('tab.add');

      update(tabs => {
        // Prevent too many tabs - remove oldest if at limit
        if (tabs.size >= MAX_TABS) {
          tabLogger.warn('Max tabs reached, removing oldest', { max: MAX_TABS });
          const oldestKey = Array.from(tabs.keys())[0];
          if (oldestKey && oldestKey !== tabId) {
            tabs.delete(oldestKey);
            tabLogger.info('Removed oldest tab', { tabId: oldestKey });
          }
        }

        tabs.set(tabId, createTabData(tabData));
        return new Map(tabs);
      });

      operationCount++;
      endTimer();
      schedulePersist();

      tabLogger.debug('Tab added', { tabId, title: tabData.title });
      return true;
    },

    /**
     * Remove a tab with cleanup
     */
    remove: (tabId) => {
      if (!validators.tabId(tabId)) {
        tabLogger.error('Invalid tab ID for removal', { tabId });
        return false;
      }

      const endTimer = perfMonitor.startTimer('tab.remove');

      let removed = false;
      update(tabs => {
        removed = tabs.delete(tabId);
        return new Map(tabs);
      });

      // Also remove from pending updates
      pendingUpdates.delete(tabId);

      endTimer();
      schedulePersist();

      if (removed) {
        tabLogger.debug('Tab removed', { tabId });
      }
      return removed;
    },

    /**
     * Batched update for high-frequency changes (loading, navigation)
     */
    updateTab: (tabId, data) => {
      if (!validators.tabId(tabId)) return false;

      const current = pendingUpdates.get(tabId) || {};
      pendingUpdates.set(tabId, { ...current, ...data });
      scheduleFlush();
      return true;
    },

    /**
     * Immediate update for critical changes (crashes, user actions)
     */
    updateTabImmediate: (tabId, data) => {
      if (!validators.tabId(tabId)) return false;

      const endTimer = perfMonitor.startTimer('tab.updateImmediate');

      update(tabs => {
        const tab = tabs.get(tabId);
        if (tab) {
          tabs.set(tabId, {
            ...tab,
            ...data,
            _lastUpdate: Date.now()
          });
        }
        return new Map(tabs);
      });

      endTimer();
      schedulePersist();
      return true;
    },

    /**
     * Mark tab as having an error
     */
    incrementError: (tabId) => {
      update(tabs => {
        const tab = tabs.get(tabId);
        if (tab) {
          tabs.set(tabId, {
            ...tab,
            errorCount: (tab.errorCount || 0) + 1,
            _lastUpdate: Date.now()
          });
        }
        return new Map(tabs);
      });
    },

    /**
     * Get a single tab without subscription
     */
    getTab: (tabId) => {
      const tabs = get({ subscribe });
      return tabs.get(tabId) || null;
    },

    /**
     * Get all tabs as array
     */
    getAll: () => {
      const tabs = get({ subscribe });
      return Array.from(tabs.entries()).map(([id, data]) => ({ id, ...data }));
    },

    /**
     * Check if a tab exists
     */
    has: (tabId) => {
      const tabs = get({ subscribe });
      return tabs.has(tabId);
    },

    /**
     * Clear all tabs with cleanup
     */
    clear: () => {
      pendingUpdates.clear();
      if (batchTimeout) {
        cancelAnimationFrame(batchTimeout);
        batchTimeout = null;
      }
      if (persistTimeout) {
        clearTimeout(persistTimeout);
        persistTimeout = null;
      }
      set(new Map());
      sessionStorage.removeItem('constantine_tabs');
      tabLogger.info('All tabs cleared');
    },

    /**
     * Recover tabs from storage
     */
    recover: recoverState,

    /**
     * Get store statistics
     */
    getStats: () => ({
      count: get({ subscribe }).size,
      maxTabs: MAX_TABS,
      operationCount,
      pendingUpdates: pendingUpdates.size,
      lastPersistTime
    }),

    /**
     * Cleanup on destroy
     */
    destroy: () => {
      if (batchTimeout) {
        cancelAnimationFrame(batchTimeout);
      }
      if (persistTimeout) {
        clearTimeout(persistTimeout);
      }
      pendingUpdates.clear();
      tabLogger.debug('Tab store destroyed');
    }
  };
}

export const tabs = createTabStore();

// ============================================
// Active Tab Store with persistence
// ============================================

function createActiveTabIdStore() {
  const { subscribe, set: originalSet } = writable(null);

  return {
    subscribe,
    set: (tabId) => {
      if (tabId !== null && !validators.tabId(tabId)) {
        tabLogger.error('Invalid active tab ID', { tabId });
        return;
      }

      // Persist active tab for recovery
      try {
        if (tabId) {
          sessionStorage.setItem('constantine_activeTab', tabId);
        } else {
          sessionStorage.removeItem('constantine_activeTab');
        }
      } catch (e) {
        // Ignore storage errors
      }

      originalSet(tabId);
      tabLogger.debug('Active tab changed', { tabId });
    },

    /**
     * Recover active tab from storage
     */
    recover: () => {
      try {
        return sessionStorage.getItem('constantine_activeTab');
      } catch {
        return null;
      }
    }
  };
}

export const activeTabId = createActiveTabIdStore();

// ============================================
// Derived Stores
// ============================================

// Active tab data - memoized
export const activeTab = derived(
  [tabs, activeTabId],
  ([$tabs, $activeTabId]) => {
    if (!$activeTabId) return null;
    return $tabs.get($activeTabId) || null;
  },
  null
);

// Tab count
export const tabCount = derived(tabs, $tabs => $tabs.size);

// Has tabs
export const hasTabs = derived(tabs, $tabs => $tabs.size > 0);

// Loading tabs count
export const loadingTabsCount = derived(tabs, $tabs => {
  let count = 0;
  $tabs.forEach(tab => {
    if (tab.loading) count++;
  });
  return count;
});

// Crashed tabs
export const crashedTabs = derived(tabs, $tabs => {
  const crashed = [];
  $tabs.forEach((tab, id) => {
    if (tab.crashed) crashed.push({ id, ...tab });
  });
  return crashed;
});

// Unresponsive tabs
export const unresponsiveTabs = derived(tabs, $tabs => {
  const unresponsive = [];
  $tabs.forEach((tab, id) => {
    if (tab.unresponsive) unresponsive.push({ id, ...tab });
  });
  return unresponsive;
});

// Tab list as array (for rendering) - sorted by creation time
export const tabList = derived(tabs, $tabs =>
  Array.from($tabs.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (a._createdAt || 0) - (b._createdAt || 0))
);

// ============================================
// Privacy Store with persistence
// ============================================

const defaultPrivacy = Object.freeze({
  torEnabled: false,
  blockTrackers: true,
  blockFingerprinting: true,
  blockThirdPartyCookies: true,
  blockWebRTC: false,
  spoofUserAgent: true,
  doNotTrack: true,
  httpsUpgrade: true,
  clearOnExit: false,
  blockScripts: false,
  strictMode: false
});

function createPrivacyStore() {
  // Try to recover from localStorage
  let initial = { ...defaultPrivacy };
  try {
    const stored = localStorage.getItem('constantine_privacy');
    if (stored) {
      const parsed = JSON.parse(stored);
      initial = { ...defaultPrivacy, ...parsed };
      privacyLogger.debug('Privacy settings recovered', { settings: initial });
    }
  } catch (e) {
    privacyLogger.warn('Failed to recover privacy settings');
  }

  const { subscribe, set, update } = writable(initial);

  // Persist on changes
  const persist = (settings) => {
    try {
      localStorage.setItem('constantine_privacy', JSON.stringify(settings));
    } catch (e) {
      privacyLogger.warn('Failed to persist privacy settings');
    }
  };

  return {
    subscribe,

    /**
     * Update entire settings object
     */
    set: (settings) => {
      set(settings);
      persist(settings);
      privacyLogger.info('Privacy settings updated', { settings });
    },

    /**
     * Update single setting with change detection
     */
    setSetting: (key, value) => {
      update(current => {
        if (current[key] === value) return current;
        const updated = { ...current, [key]: value };
        persist(updated);
        privacyLogger.debug('Privacy setting changed', { key, value });
        return updated;
      });
    },

    /**
     * Toggle a boolean setting
     */
    toggle: (key) => {
      update(current => {
        if (typeof current[key] !== 'boolean') return current;
        const updated = { ...current, [key]: !current[key] };
        persist(updated);
        privacyLogger.debug('Privacy setting toggled', { key, value: updated[key] });
        return updated;
      });
    },

    /**
     * Reset to defaults
     */
    reset: () => {
      set({ ...defaultPrivacy });
      persist(defaultPrivacy);
      privacyLogger.info('Privacy settings reset to defaults');
    },

    /**
     * Get current settings without subscribing
     */
    getAll: () => get({ subscribe }),

    /**
     * Export settings for backup
     */
    export: () => JSON.stringify(get({ subscribe }), null, 2),

    /**
     * Import settings from backup
     */
    import: (json) => {
      try {
        const parsed = JSON.parse(json);
        const merged = { ...defaultPrivacy, ...parsed };
        set(merged);
        persist(merged);
        privacyLogger.info('Privacy settings imported');
        return true;
      } catch (e) {
        privacyLogger.error('Failed to import privacy settings', { error: e.message });
        return false;
      }
    }
  };
}

export const privacy = createPrivacyStore();

// Derived: protection level for status indicator
export const protectionLevel = derived(privacy, $privacy => {
  if ($privacy.torEnabled) return 'tor';
  if ($privacy.strictMode) return 'strict';
  if ($privacy.blockTrackers && $privacy.blockFingerprinting) return 'protected';
  if ($privacy.blockTrackers || $privacy.blockFingerprinting) return 'basic';
  return 'standard';
});

// Protection score (0-100)
export const protectionScore = derived(privacy, $privacy => {
  let score = 0;
  if ($privacy.torEnabled) score += 30;
  if ($privacy.blockTrackers) score += 15;
  if ($privacy.blockFingerprinting) score += 15;
  if ($privacy.blockThirdPartyCookies) score += 10;
  if ($privacy.blockWebRTC) score += 10;
  if ($privacy.spoofUserAgent) score += 5;
  if ($privacy.doNotTrack) score += 5;
  if ($privacy.httpsUpgrade) score += 5;
  if ($privacy.clearOnExit) score += 5;
  return Math.min(score, 100);
});

// ============================================
// UI State Stores
// ============================================

export const panelState = writable({
  open: false,
  activePanel: null,
  width: 340
});

export const platform = writable({
  isWindows: false,
  isMac: false,
  isLinux: false,
  arch: null,
  version: null
});

function createAppStatusStore() {
  const { subscribe, set, update } = writable({
    isOnline: navigator.onLine,
    isFullscreen: false,
    hasSessionToRestore: false,
    zoomLevel: 0,
    memoryUsage: null,
    ipcStatus: 'connected',
    lastError: null,
    startTime: Date.now()
  });

  // Setup memory monitoring
  const updateMemory = () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      update(s => ({
        ...s,
        memoryUsage: {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.jsHeapSizeLimit,
          percent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(1)
        }
      }));
    }
  };

  // Update memory every 30 seconds
  const memoryInterval = setInterval(updateMemory, 30000);
  updateMemory(); // Initial update

  return {
    subscribe,
    set,
    update,

    /**
     * Set online status
     */
    setOnline: (isOnline) => {
      update(s => {
        if (s.isOnline === isOnline) return s;
        storeLogger.info('Network status changed', { isOnline });
        return { ...s, isOnline };
      });
    },

    /**
     * Set fullscreen status
     */
    setFullscreen: (isFullscreen) => {
      update(s => ({ ...s, isFullscreen }));
    },

    /**
     * Record an error
     */
    recordError: (error) => {
      update(s => ({
        ...s,
        lastError: {
          message: error.message,
          timestamp: Date.now()
        }
      }));
    },

    /**
     * Set IPC status
     */
    setIPCStatus: (status) => {
      update(s => ({ ...s, ipcStatus: status }));
    },

    /**
     * Get uptime in seconds
     */
    getUptime: () => {
      const current = get({ subscribe });
      return Math.floor((Date.now() - current.startTime) / 1000);
    },

    /**
     * Cleanup
     */
    destroy: () => {
      clearInterval(memoryInterval);
    }
  };
}

export const appStatus = createAppStatusStore();

// ============================================
// Notifications Store with cleanup
// ============================================

function createNotificationStore() {
  const { subscribe, update, set } = writable([]);
  let idCounter = 0;
  const timeouts = new Map();

  // Cleanup old notifications periodically
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    update(notifications =>
      notifications.filter(n => {
        if (n._expiresAt && now > n._expiresAt) {
          timeouts.delete(n.id);
          return false;
        }
        return true;
      })
    );
  }, NOTIFICATION_CLEANUP_INTERVAL);

  return {
    subscribe,

    /**
     * Show a notification
     * @param {string} type - 'success' | 'error' | 'warning' | 'info'
     * @param {string} message - Notification message
     * @param {number} duration - Duration in ms (0 for persistent)
     */
    show: (type, message, duration = 3000) => {
      const id = ++idCounter;
      const notification = {
        id,
        type,
        message: sanitizeInput(message, 'html'),
        _createdAt: Date.now(),
        _expiresAt: duration > 0 ? Date.now() + duration : null
      };

      update(notifications => {
        // Limit to MAX_NOTIFICATIONS, remove oldest
        const limited = notifications.length >= MAX_NOTIFICATIONS
          ? notifications.slice(1)
          : notifications;
        return [...limited, notification];
      });

      // Store timeout for cleanup
      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          update(n => n.filter(x => x.id !== id));
          timeouts.delete(id);
        }, duration);
        timeouts.set(id, timeoutId);
      }

      storeLogger.debug('Notification shown', { type, message, duration });
      return id;
    },

    /**
     * Dismiss a notification
     */
    dismiss: (id) => {
      const timeoutId = timeouts.get(id);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeouts.delete(id);
      }
      update(n => n.filter(x => x.id !== id));
    },

    /**
     * Dismiss all notifications of a type
     */
    dismissType: (type) => {
      update(notifications => {
        notifications.forEach(n => {
          if (n.type === type) {
            const timeoutId = timeouts.get(n.id);
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeouts.delete(n.id);
            }
          }
        });
        return notifications.filter(n => n.type !== type);
      });
    },

    /**
     * Clear all notifications
     */
    clear: () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      set([]);
    },

    /**
     * Cleanup on destroy
     */
    destroy: () => {
      clearInterval(cleanupInterval);
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    }
  };
}

export const notifications = createNotificationStore();

// ============================================
// Search/URL Input Store
// ============================================

function createSearchStore() {
  const { subscribe, set, update } = writable({
    query: '',
    suggestions: [],
    selectedIndex: -1,
    isLoading: false,
    history: []
  });

  // Load history from storage
  try {
    const stored = localStorage.getItem('constantine_searchHistory');
    if (stored) {
      const history = JSON.parse(stored);
      update(s => ({ ...s, history: history.slice(0, 100) }));
    }
  } catch (e) {
    // Ignore
  }

  return {
    subscribe,

    setQuery: (query) => update(s => ({
      ...s,
      query: sanitizeInput(query),
      selectedIndex: -1
    })),

    setSuggestions: (suggestions) => update(s => ({
      ...s,
      suggestions,
      selectedIndex: -1
    })),

    selectNext: () => update(s => ({
      ...s,
      selectedIndex: Math.min(s.selectedIndex + 1, s.suggestions.length - 1)
    })),

    selectPrev: () => update(s => ({
      ...s,
      selectedIndex: Math.max(s.selectedIndex - 1, -1)
    })),

    getSelected: () => {
      const state = get({ subscribe });
      if (state.selectedIndex >= 0 && state.selectedIndex < state.suggestions.length) {
        return state.suggestions[state.selectedIndex];
      }
      return null;
    },

    addToHistory: (query) => {
      if (!query || !validators.searchQuery(query)) return;

      update(s => {
        const history = [query, ...s.history.filter(h => h !== query)].slice(0, 100);
        try {
          localStorage.setItem('constantine_searchHistory', JSON.stringify(history));
        } catch (e) {
          // Ignore
        }
        return { ...s, history };
      });
    },

    clearHistory: () => {
      update(s => ({ ...s, history: [] }));
      try {
        localStorage.removeItem('constantine_searchHistory');
      } catch (e) {
        // Ignore
      }
    },

    reset: () => set({
      query: '',
      suggestions: [],
      selectedIndex: -1,
      isLoading: false,
      history: get({ subscribe }).history
    })
  };
}

export const searchStore = createSearchStore();

// ============================================
// Downloads Store
// ============================================

function createDownloadsStore() {
  const { subscribe, update, set } = writable(new Map());

  return {
    subscribe,

    add: (downloadId, data) => {
      update(downloads => {
        downloads.set(downloadId, {
          id: downloadId,
          filename: data.filename || 'Unknown',
          url: data.url || '',
          totalBytes: data.totalBytes || 0,
          receivedBytes: 0,
          state: 'progressing', // progressing, completed, cancelled, interrupted
          startTime: Date.now(),
          ...data
        });
        return new Map(downloads);
      });
      storeLogger.debug('Download started', { downloadId, filename: data.filename });
    },

    updateProgress: (downloadId, receivedBytes, totalBytes) => {
      update(downloads => {
        const download = downloads.get(downloadId);
        if (download) {
          downloads.set(downloadId, {
            ...download,
            receivedBytes,
            totalBytes: totalBytes || download.totalBytes
          });
        }
        return new Map(downloads);
      });
    },

    complete: (downloadId) => {
      update(downloads => {
        const download = downloads.get(downloadId);
        if (download) {
          downloads.set(downloadId, {
            ...download,
            state: 'completed',
            endTime: Date.now()
          });
        }
        return new Map(downloads);
      });
      storeLogger.info('Download completed', { downloadId });
    },

    cancel: (downloadId) => {
      update(downloads => {
        const download = downloads.get(downloadId);
        if (download) {
          downloads.set(downloadId, {
            ...download,
            state: 'cancelled',
            endTime: Date.now()
          });
        }
        return new Map(downloads);
      });
    },

    remove: (downloadId) => {
      update(downloads => {
        downloads.delete(downloadId);
        return new Map(downloads);
      });
    },

    clear: () => set(new Map()),

    getAll: () => Array.from(get({ subscribe }).values())
  };
}

export const downloads = createDownloadsStore();

// Active downloads count
export const activeDownloadsCount = derived(downloads, $downloads => {
  let count = 0;
  $downloads.forEach(d => {
    if (d.state === 'progressing') count++;
  });
  return count;
});

// ============================================
// Static data (not reactive - no store overhead)
// ============================================

export const OSINT_BOOKMARKS = Object.freeze({
  'Username Search': Object.freeze([
    { name: 'Namechk', url: 'https://namechk.com/', description: 'Check username availability across platforms' },
    { name: 'WhatsMyName', url: 'https://whatsmyname.app/', description: 'Username enumeration' },
    { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock', description: 'Hunt usernames across social networks' },
    { name: 'UserSearch', url: 'https://usersearch.org/', description: 'Search usernames across 100+ sites' },
    { name: 'Instant Username', url: 'https://instantusername.com/', description: 'Quick username availability check' }
  ]),
  'Email Search': Object.freeze([
    { name: 'Hunter.io', url: 'https://hunter.io/', description: 'Email finder and verifier' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/', description: 'Check if email was in a data breach' },
    { name: 'Epieos', url: 'https://epieos.com/', description: 'Email OSINT tool' },
    { name: 'EmailRep', url: 'https://emailrep.io/', description: 'Email reputation and threat intel' },
    { name: 'Holehe', url: 'https://github.com/megadose/holehe', description: 'Check email registration on sites' }
  ]),
  'Domain & IP': Object.freeze([
    { name: 'Shodan', url: 'https://www.shodan.io/', description: 'Search engine for Internet-connected devices' },
    { name: 'Censys', url: 'https://censys.io/', description: 'Attack surface management' },
    { name: 'SecurityTrails', url: 'https://securitytrails.com/', description: 'DNS and domain intelligence' },
    { name: 'DNSDumpster', url: 'https://dnsdumpster.com/', description: 'DNS recon and research' },
    { name: 'crt.sh', url: 'https://crt.sh/', description: 'Certificate transparency logs' },
    { name: 'VirusTotal', url: 'https://www.virustotal.com/', description: 'Analyze suspicious files and URLs' },
    { name: 'ViewDNS', url: 'https://viewdns.info/', description: 'DNS tools collection' },
    { name: 'IPinfo', url: 'https://ipinfo.io/', description: 'IP address geolocation and details' }
  ]),
  'Image Analysis': Object.freeze([
    { name: 'TinEye', url: 'https://tineye.com/', description: 'Reverse image search' },
    { name: 'Yandex Images', url: 'https://yandex.com/images/', description: 'Reverse image search (best for faces)' },
    { name: 'PimEyes', url: 'https://pimeyes.com/', description: 'Face recognition search engine' },
    { name: 'FotoForensics', url: 'https://fotoforensics.com/', description: 'Image forensics and analysis' },
    { name: 'Google Lens', url: 'https://lens.google.com/', description: 'Visual search by Google' }
  ]),
  'Social Media': Object.freeze([
    { name: 'Social Searcher', url: 'https://www.social-searcher.com/', description: 'Free social media search engine' },
    { name: 'Social Blade', url: 'https://socialblade.com/', description: 'Social media statistics' },
    { name: 'Followerwonk', url: 'https://followerwonk.com/', description: 'Twitter analytics' },
    { name: 'TweetDeck', url: 'https://tweetdeck.twitter.com/', description: 'Twitter monitoring' }
  ]),
  'Archives': Object.freeze([
    { name: 'Wayback Machine', url: 'https://web.archive.org/', description: 'Internet archive' },
    { name: 'Archive.org', url: 'https://archive.org/', description: 'Digital library' },
    { name: 'CachedView', url: 'https://cachedview.com/', description: 'View cached pages' },
    { name: 'Google Cache', url: 'https://webcache.googleusercontent.com/', description: 'Google cached pages' }
  ]),
  'People Search': Object.freeze([
    { name: 'Pipl', url: 'https://pipl.com/', description: 'People search engine' },
    { name: 'ThatsThem', url: 'https://thatsthem.com/', description: 'Free people search' },
    { name: 'Whitepages', url: 'https://www.whitepages.com/', description: 'People finder' },
    { name: 'Spokeo', url: 'https://www.spokeo.com/', description: 'People search engine' },
    { name: 'FamilyTreeNow', url: 'https://www.familytreenow.com/', description: 'Genealogy and people search' }
  ]),
  'Threat Intel': Object.freeze([
    { name: 'VirusTotal', url: 'https://www.virustotal.com/', description: 'Malware analysis' },
    { name: 'Hybrid Analysis', url: 'https://www.hybrid-analysis.com/', description: 'Free malware analysis' },
    { name: 'Any.run', url: 'https://any.run/', description: 'Interactive malware hunting' },
    { name: 'AbuseIPDB', url: 'https://www.abuseipdb.com/', description: 'IP abuse database' },
    { name: 'URLhaus', url: 'https://urlhaus.abuse.ch/', description: 'Malicious URL database' },
    { name: 'MalwareBazaar', url: 'https://bazaar.abuse.ch/', description: 'Malware sample sharing' }
  ]),
  'Code & Tech': Object.freeze([
    { name: 'GitHub', url: 'https://github.com/', description: 'Code repository search' },
    { name: 'GitLab', url: 'https://gitlab.com/', description: 'Code repository' },
    { name: 'Grep.app', url: 'https://grep.app/', description: 'Search across repos' },
    { name: 'SearchCode', url: 'https://searchcode.com/', description: 'Code search engine' },
    { name: 'PublicWWW', url: 'https://publicwww.com/', description: 'Source code search' }
  ])
});

export const QUICK_LINKS = Object.freeze([
  { title: 'OSINT Framework', url: 'https://osintframework.com', icon: '&#128269;', description: 'Collection of OSINT tools' },
  { title: 'Shodan', url: 'https://www.shodan.io', icon: '&#127760;', description: 'IoT search engine' },
  { title: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', icon: '&#128274;', description: 'Data breach checker' },
  { title: 'Wayback Machine', url: 'https://web.archive.org', icon: '&#128197;', description: 'Web archive' },
  { title: 'VirusTotal', url: 'https://www.virustotal.com', icon: '&#128737;', description: 'Malware scanner' },
  { title: 'PimEyes', url: 'https://pimeyes.com', icon: '&#128065;', description: 'Face search' },
  { title: 'Hunter.io', url: 'https://hunter.io', icon: '&#128231;', description: 'Email finder' },
  { title: 'Intelligence X', url: 'https://intelx.io', icon: '&#128373;', description: 'Data leak search' }
]);

// ============================================
// Search Engines
// ============================================

export const SEARCH_ENGINES = Object.freeze({
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: '🦆'
  },
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: '🔍'
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: '🔎'
  },
  startpage: {
    name: 'Startpage',
    url: 'https://www.startpage.com/sp/search?query=',
    icon: '🌐'
  },
  brave: {
    name: 'Brave Search',
    url: 'https://search.brave.com/search?q=',
    icon: '🦁'
  }
});

export const defaultSearchEngine = writable('duckduckgo');

// ============================================
// Global cleanup function
// ============================================

export function destroyAllStores() {
  tabs.destroy();
  appStatus.destroy();
  notifications.destroy();
  storeLogger.info('All stores destroyed');
}

// Register for memory pressure events
memoryManager.onMemoryPressure((event, data) => {
  if (event === 'critical') {
    storeLogger.warn('Critical memory pressure, clearing caches');
    // Clear non-essential caches
    searchStore.reset();
  }
});
