/**
 * CONSTANTINE Browser - Optimized Svelte State Store
 * Performance-focused reactive state management
 */

import { writable, derived, get } from 'svelte/store';

// ============================================
// Performance utilities
// ============================================

// Debounce for high-frequency updates
export function debounce(fn, ms = 16) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

// Throttle for rate-limiting
export function throttle(fn, ms = 16) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ============================================
// Tab Store - Optimized with batching
// ============================================

function createTabStore() {
  const { subscribe, set, update } = writable(new Map());
  let batchTimeout = null;
  let pendingUpdates = new Map();

  // Batch updates for performance
  const flushUpdates = () => {
    if (pendingUpdates.size === 0) return;

    update(tabs => {
      pendingUpdates.forEach((data, tabId) => {
        const existing = tabs.get(tabId);
        if (existing) {
          tabs.set(tabId, { ...existing, ...data });
        }
      });
      pendingUpdates.clear();
      return new Map(tabs);
    });
  };

  const scheduleFlush = () => {
    if (batchTimeout) return;
    batchTimeout = requestAnimationFrame(() => {
      batchTimeout = null;
      flushUpdates();
    });
  };

  return {
    subscribe,
    set,

    // Immediate add (not batched)
    add: (tabId, tabData) => update(tabs => {
      tabs.set(tabId, {
        title: tabData.title || 'New Tab',
        favicon: tabData.favicon || null,
        url: tabData.url || '',
        loading: false,
        canGoBack: false,
        canGoForward: false,
        crashed: false,
        unresponsive: false,
        ...tabData
      });
      return new Map(tabs);
    }),

    // Immediate remove (not batched)
    remove: (tabId) => update(tabs => {
      tabs.delete(tabId);
      return new Map(tabs);
    }),

    // Batched updates for high-frequency changes
    updateTab: (tabId, data) => {
      const current = pendingUpdates.get(tabId) || {};
      pendingUpdates.set(tabId, { ...current, ...data });
      scheduleFlush();
    },

    // Immediate update for critical changes
    updateTabImmediate: (tabId, data) => update(tabs => {
      const tab = tabs.get(tabId);
      if (tab) {
        tabs.set(tabId, { ...tab, ...data });
      }
      return new Map(tabs);
    }),

    // Efficient getter using get()
    getTab: (tabId) => {
      const currentTabs = get({ subscribe });
      return currentTabs.get(tabId);
    },

    clear: () => set(new Map())
  };
}

export const tabs = createTabStore();
export const activeTabId = writable(null);

// Derived store for active tab - memoized
export const activeTab = derived(
  [tabs, activeTabId],
  ([$tabs, $activeTabId], set) => {
    const tab = $tabs.get($activeTabId) || null;
    set(tab);
  },
  null
);

// Derived store for tab count (avoids recalculating in components)
export const tabCount = derived(tabs, $tabs => $tabs.size);

// ============================================
// Privacy settings - with change detection
// ============================================

const defaultPrivacy = {
  torEnabled: false,
  blockTrackers: true,
  blockFingerprinting: true,
  blockThirdPartyCookies: true,
  blockWebRTC: false,
  spoofUserAgent: true,
  doNotTrack: true,
  httpsUpgrade: true,
  clearOnExit: false
};

function createPrivacyStore() {
  const { subscribe, set, update } = writable(defaultPrivacy);

  return {
    subscribe,
    set,
    update,
    // Only update if value actually changed
    setSetting: (key, value) => update(current => {
      if (current[key] === value) return current;
      return { ...current, [key]: value };
    }),
    reset: () => set(defaultPrivacy)
  };
}

export const privacy = createPrivacyStore();

// Derived: protection level for status indicator
export const protectionLevel = derived(privacy, $privacy => {
  if ($privacy.torEnabled) return 'tor';
  if ($privacy.blockTrackers || $privacy.blockFingerprinting) return 'protected';
  return 'standard';
});

// ============================================
// UI state
// ============================================

export const panelState = writable({
  open: false,
  activePanel: null
});

export const platform = writable({
  isWindows: false,
  isMac: false,
  isLinux: false
});

export const appStatus = writable({
  isOnline: true,
  isFullscreen: false,
  hasSessionToRestore: false,
  zoomLevel: 0
});

// ============================================
// Notifications - with cleanup
// ============================================

function createNotificationStore() {
  const { subscribe, update } = writable([]);
  let idCounter = 0;
  const timeouts = new Map();

  return {
    subscribe,
    show: (type, message, duration = 3000) => {
      const id = ++idCounter;

      update(notifications => {
        // Limit to 5, remove oldest
        const limited = notifications.length >= 5
          ? notifications.slice(1)
          : notifications;
        return [...limited, { id, type, message }];
      });

      // Store timeout for cleanup
      const timeoutId = setTimeout(() => {
        update(n => n.filter(x => x.id !== id));
        timeouts.delete(id);
      }, duration);

      timeouts.set(id, timeoutId);
      return id;
    },

    dismiss: (id) => {
      // Clear timeout if exists
      const timeoutId = timeouts.get(id);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeouts.delete(id);
      }
      update(n => n.filter(x => x.id !== id));
    },

    clear: () => {
      // Clear all timeouts
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      update(() => []);
    }
  };
}

export const notifications = createNotificationStore();

// ============================================
// Static data (not reactive - no store overhead)
// ============================================

export const OSINT_BOOKMARKS = Object.freeze({
  'Username Search': Object.freeze([
    { name: 'Namechk', url: 'https://namechk.com/' },
    { name: 'WhatsMyName', url: 'https://whatsmyname.app/' },
    { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock' },
    { name: 'UserSearch', url: 'https://usersearch.org/' }
  ]),
  'Email Search': Object.freeze([
    { name: 'Hunter.io', url: 'https://hunter.io/' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/' },
    { name: 'Epieos', url: 'https://epieos.com/' },
    { name: 'EmailRep', url: 'https://emailrep.io/' }
  ]),
  'Domain & IP': Object.freeze([
    { name: 'Shodan', url: 'https://www.shodan.io/' },
    { name: 'Censys', url: 'https://censys.io/' },
    { name: 'SecurityTrails', url: 'https://securitytrails.com/' },
    { name: 'DNSDumpster', url: 'https://dnsdumpster.com/' },
    { name: 'crt.sh', url: 'https://crt.sh/' },
    { name: 'VirusTotal', url: 'https://www.virustotal.com/' }
  ]),
  'Image Analysis': Object.freeze([
    { name: 'TinEye', url: 'https://tineye.com/' },
    { name: 'Yandex Images', url: 'https://yandex.com/images/' },
    { name: 'PimEyes', url: 'https://pimeyes.com/' },
    { name: 'FotoForensics', url: 'https://fotoforensics.com/' }
  ]),
  'Social Media': Object.freeze([
    { name: 'Social Searcher', url: 'https://www.social-searcher.com/' },
    { name: 'Social Blade', url: 'https://socialblade.com/' }
  ]),
  'Archives': Object.freeze([
    { name: 'Wayback Machine', url: 'https://web.archive.org/' },
    { name: 'Archive.org', url: 'https://archive.org/' },
    { name: 'CachedView', url: 'https://cachedview.com/' }
  ]),
  'People Search': Object.freeze([
    { name: 'Pipl', url: 'https://pipl.com/' },
    { name: 'ThatsThem', url: 'https://thatsthem.com/' },
    { name: 'Whitepages', url: 'https://www.whitepages.com/' }
  ]),
  'Threat Intel': Object.freeze([
    { name: 'VirusTotal', url: 'https://www.virustotal.com/' },
    { name: 'Hybrid Analysis', url: 'https://www.hybrid-analysis.com/' },
    { name: 'Any.run', url: 'https://any.run/' },
    { name: 'AbuseIPDB', url: 'https://www.abuseipdb.com/' }
  ])
});

export const QUICK_LINKS = Object.freeze([
  { title: 'OSINT Framework', url: 'https://osintframework.com', icon: '&#128269;' },
  { title: 'Shodan', url: 'https://www.shodan.io', icon: '&#127760;' },
  { title: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', icon: '&#128274;' },
  { title: 'Wayback Machine', url: 'https://web.archive.org', icon: '&#128197;' },
  { title: 'VirusTotal', url: 'https://www.virustotal.com', icon: '&#128737;' },
  { title: 'PimEyes', url: 'https://pimeyes.com', icon: '&#128065;' },
  { title: 'Hunter.io', url: 'https://hunter.io', icon: '&#128231;' },
  { title: 'Intelligence X', url: 'https://intelx.io', icon: '&#128373;' }
]);
