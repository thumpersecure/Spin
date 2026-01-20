/**
 * CONSTANTINE Browser - Production Tab Store
 * Robust tab management with persistence, recovery, and monitoring
 */

import { writable, derived, get } from 'svelte/store';
import { storeLogger, perfMonitor, validators } from '../lib/resilience.js';

// ============================================
// Constants
// ============================================

const MAX_TABS = 100; // Prevent memory issues
const TAB_UPDATE_BATCH_MS = 16; // ~60fps
const PERSIST_DEBOUNCE_MS = 1000;

// ============================================
// Tab Store with Production Features
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

  // Flush batched updates using RAF for smooth rendering
  const flushUpdates = () => {
    if (pendingUpdates.size === 0) return;

    const endTimer = perfMonitor.startTimer('tab.batchUpdate');

    update(tabs => {
      pendingUpdates.forEach((data, tabId) => {
        const existing = tabs.get(tabId);
        if (existing) {
          tabs.set(tabId, { ...existing, ...data, _lastUpdate: Date.now() });
        }
      });
      pendingUpdates.clear();
      return new Map(tabs);
    });

    endTimer();
    schedulePersist();
  };

  const scheduleFlush = () => {
    if (batchTimeout) return;
    batchTimeout = requestAnimationFrame(() => {
      batchTimeout = null;
      flushUpdates();
    });
  };

  // Debounced persistence
  const schedulePersist = () => {
    if (persistTimeout) clearTimeout(persistTimeout);
    persistTimeout = setTimeout(() => {
      persistState();
    }, PERSIST_DEBOUNCE_MS);
  };

  const persistState = () => {
    try {
      const tabs = get({ subscribe });
      const serializable = Array.from(tabs.entries()).map(([id, tab]) => ({
        id,
        url: tab.url,
        title: tab.title,
        favicon: tab.favicon
      }));

      // Store in sessionStorage for crash recovery
      sessionStorage.setItem('constantine_tabs', JSON.stringify(serializable));
      storeLogger.debug('Tabs persisted', { count: serializable.length });
    } catch (error) {
      storeLogger.warn('Failed to persist tabs', { error: error.message });
    }
  };

  // Recovery from crash
  const recoverState = () => {
    try {
      const stored = sessionStorage.getItem('constantine_tabs');
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return null;

      storeLogger.info('Recovered tabs from storage', { count: parsed.length });
      return parsed;
    } catch (error) {
      storeLogger.warn('Failed to recover tabs', { error: error.message });
      return null;
    }
  };

  // Create default tab data
  const createTabData = (tabData = {}) => ({
    title: tabData.title || 'New Tab',
    favicon: tabData.favicon || null,
    url: tabData.url || '',
    loading: false,
    canGoBack: false,
    canGoForward: false,
    crashed: false,
    unresponsive: false,
    _createdAt: Date.now(),
    _lastUpdate: Date.now(),
    ...tabData
  });

  return {
    subscribe,
    set,

    // Add a new tab with validation
    add: (tabId, tabData = {}) => {
      if (!validators.tabId(tabId)) {
        storeLogger.error('Invalid tab ID', { tabId });
        return false;
      }

      const endTimer = perfMonitor.startTimer('tab.add');

      update(tabs => {
        // Prevent too many tabs
        if (tabs.size >= MAX_TABS) {
          storeLogger.warn('Max tabs reached', { max: MAX_TABS });
          // Remove oldest non-active tab
          const oldestKey = Array.from(tabs.keys())[0];
          if (oldestKey && oldestKey !== tabId) {
            tabs.delete(oldestKey);
            storeLogger.info('Removed oldest tab', { tabId: oldestKey });
          }
        }

        tabs.set(tabId, createTabData(tabData));
        return new Map(tabs);
      });

      operationCount++;
      endTimer();
      schedulePersist();

      storeLogger.debug('Tab added', { tabId, title: tabData.title });
      return true;
    },

    // Remove a tab
    remove: (tabId) => {
      if (!validators.tabId(tabId)) {
        storeLogger.error('Invalid tab ID for removal', { tabId });
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
        storeLogger.debug('Tab removed', { tabId });
      }
      return removed;
    },

    // Batched update for high-frequency changes (loading, navigation)
    updateTab: (tabId, data) => {
      if (!validators.tabId(tabId)) return false;

      const current = pendingUpdates.get(tabId) || {};
      pendingUpdates.set(tabId, { ...current, ...data });
      scheduleFlush();
      return true;
    },

    // Immediate update for critical changes (crashes, user actions)
    updateTabImmediate: (tabId, data) => {
      if (!validators.tabId(tabId)) return false;

      const endTimer = perfMonitor.startTimer('tab.updateImmediate');

      update(tabs => {
        const tab = tabs.get(tabId);
        if (tab) {
          tabs.set(tabId, { ...tab, ...data, _lastUpdate: Date.now() });
        }
        return new Map(tabs);
      });

      endTimer();
      schedulePersist();
      return true;
    },

    // Get a single tab without subscription
    getTab: (tabId) => {
      const tabs = get({ subscribe });
      return tabs.get(tabId) || null;
    },

    // Get all tabs as array
    getAll: () => {
      const tabs = get({ subscribe });
      return Array.from(tabs.entries()).map(([id, data]) => ({ id, ...data }));
    },

    // Clear all tabs
    clear: () => {
      pendingUpdates.clear();
      if (batchTimeout) {
        cancelAnimationFrame(batchTimeout);
        batchTimeout = null;
      }
      set(new Map());
      sessionStorage.removeItem('constantine_tabs');
      storeLogger.info('All tabs cleared');
    },

    // Recover from crash/storage
    recover: recoverState,

    // Get stats
    getStats: () => ({
      count: get({ subscribe }).size,
      maxTabs: MAX_TABS,
      operationCount,
      pendingUpdates: pendingUpdates.size
    }),

    // Cleanup on destroy
    destroy: () => {
      if (batchTimeout) {
        cancelAnimationFrame(batchTimeout);
      }
      if (persistTimeout) {
        clearTimeout(persistTimeout);
      }
      pendingUpdates.clear();
    }
  };
}

export const tabs = createTabStore();

// ============================================
// Active Tab Store
// ============================================

function createActiveTabIdStore() {
  const { subscribe, set } = writable(null);

  return {
    subscribe,
    set: (tabId) => {
      if (tabId !== null && !validators.tabId(tabId)) {
        storeLogger.error('Invalid active tab ID', { tabId });
        return;
      }

      // Persist active tab
      try {
        if (tabId) {
          sessionStorage.setItem('constantine_activeTab', tabId);
        } else {
          sessionStorage.removeItem('constantine_activeTab');
        }
      } catch (e) {
        // Ignore storage errors
      }

      set(tabId);
      storeLogger.debug('Active tab changed', { tabId });
    },

    // Recover from storage
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

// Tab list as array (for rendering)
export const tabList = derived(tabs, $tabs =>
  Array.from($tabs.entries()).map(([id, data]) => ({ id, ...data }))
);
